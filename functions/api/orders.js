
import { json, authorized, supabaseRequest, mpToken } from "./_shared.js";

async function verifyApprovedPix(env, paymentId, expectedAmount) {
  if (!paymentId) return { ok:false, error:"Pagamento Pix não informado." };

  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
    { headers:{ Authorization:`Bearer ${mpToken(env)}` } }
  );
  const payment = await res.json();

  if (!res.ok) return { ok:false, error:payment.message || "Não foi possível validar o Pix." };

  const paid = Number(payment.transaction_amount || 0);
  const expected = Number(expectedAmount || 0);

  if (payment.status !== "approved") {
    return { ok:false, error:"O Pix ainda não foi aprovado." };
  }
  if (Math.abs(paid - expected) >= 0.01) {
    return { ok:false, error:"O valor pago no Pix não corresponde ao total do pedido." };
  }
  return { ok:true, payment };
}

export async function onRequestOptions() {
  return json({}, 204);
}

export async function onRequestGet({ request, env }) {
  try {
    // Público: catálogo completo para cliente e garçom.
    try {
      const catalog = await supabaseRequest(
        env,
        "products?select=id,category,name,description,price,active,available,sort_order&order=sort_order.asc,id.asc"
      );
      return json({ ok:true, catalog:catalog || [], products:(catalog || []).map(p=>({product_id:p.id,available:p.available})) });
    } catch {
      // Compatibilidade caso a migração V8.24 ainda não tenha sido executada.
      const products = await supabaseRequest(
        env,
        "product_availability?select=product_id,available,updated_at&order=product_id.asc"
      );
      return json({ ok:true, products:products || [] });
    }
  } catch (error) {
    console.error(error);
    return json({ ok:false, error:error.message || "Erro interno." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const action = body.action || "create";

    if (action === "create") {
      const isGarcom = String(body.origem || "").toLowerCase() === "garcom";
      const required = isGarcom ? ["cliente","itens","total","pagamento","tipo"] : ["cliente","telefone","itens","total","pagamento","tipo"];
      for (const field of required) {
        if (body[field] === undefined || body[field] === "" || body[field] === null) {
          return json({ ok:false, error:`Campo obrigatório: ${field}` }, 400);
        }
      }

      const telefone = String(body.telefone || "").replace(/\D/g, "");
      if (!isGarcom && telefone.length !== 10 && telefone.length !== 11) {
        return json({ ok:false, error:"Telefone deve conter DDD." }, 400);
      }

      if (!Array.isArray(body.itens) || !body.itens.length) {
        return json({ ok:false, error:"Adicione pelo menos um produto ao pedido." }, 400);
      }

      const temLanche = body.itens.some(item =>
        !["bebidas","doces"].includes(String(item?.categoria || "").trim().toLowerCase()) &&
        String(item?.categoria || "").trim() !== ""
      );

      if (!isGarcom && !temLanche) {
        return json({
          ok:false,
          error:"Para finalizar o pedido, é obrigatório escolher pelo menos 1 lanche. Não é permitido pedir somente bebidas e/ou doces."
        }, 400);
      }

      let pixPayment = null;
      if (String(body.pagamento) === "Pix") {
        const verified = await verifyApprovedPix(env, body.pix_payment_id, body.total);
        if (!verified.ok) return json({ ok:false, error:verified.error }, 400);
        pixPayment = verified.payment;
      }

      const order = {
        status:"novo",
        printed:false,
        cliente:String(body.cliente).trim(),
        telefone,
        endereco:String(body.endereco || "").trim(),
        bairro:String(body.bairro || "").trim(),
        referencia:String(body.referencia || "").trim(),
        localidade:String(body.localidade || "").trim(),
        tipo:String(body.tipo),
        pagamento:String(body.pagamento),
        troco:String(body.troco || "").trim(),
        observacoes:String(body.observacoes || "").trim(),
        itens:body.itens,
        subtotal:Number(body.subtotal || 0),
        entrega:Number(body.entrega || 0),
        total:Number(body.total || 0),
        pix_payment_id:pixPayment ? String(pixPayment.id) : null,
        pix_status:pixPayment ? String(pixPayment.status) : null
      };

      const inserted = await supabaseRequest(
        env,
        "orders?select=*",
        {
          method:"POST",
          headers:{ Prefer:"return=representation" },
          body:JSON.stringify(order)
        }
      );
      const saved = Array.isArray(inserted) ? inserted[0] : inserted;

      if (!isGarcom && telefone) {
        const customer = {
          telefone,
          nome:order.cliente,
          endereco:order.endereco,
          bairro:order.bairro,
          referencia:order.referencia,
          updated_at:new Date().toISOString()
        };

        await supabaseRequest(
          env,
          "customers?on_conflict=telefone",
          {
            method:"POST",
            headers:{ Prefer:"resolution=merge-duplicates,return=minimal" },
            body:JSON.stringify(customer)
          }
        );      }


      return json({ ok:true, order:saved });
    }

    if (action === "list_orders") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      const limit = Math.min(Number(body.limit || 100), 300);
      const orders = await supabaseRequest(
        env,
        `orders?select=*&order=created_at.desc&limit=${limit}`
      );
      return json({ ok:true, orders:orders || [] });
    }

    if (action === "list_products") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      const catalog = await supabaseRequest(
        env,
        "products?select=id,category,name,description,price,active,available,sort_order&order=sort_order.asc,id.asc"
      );
      return json({ ok:true, catalog:catalog || [], products:(catalog || []).map(p=>({product_id:p.id,available:p.available})) });
    }

    if (action === "create_product") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      const category=String(body.category||"").trim();
      const name=String(body.name||"").trim();
      const description=String(body.description||"").trim();
      const price=Number(body.price||0);
      if(!category||!name||price<0) return json({ok:false,error:"Preencha categoria, nome e preço."},400);

      const maxRows=await supabaseRequest(env,"products?select=sort_order&order=sort_order.desc&limit=1");
      const sortOrder=Number(maxRows?.[0]?.sort_order||0)+1;
      const inserted=await supabaseRequest(
        env,
        "products?select=id,category,name,description,price,active,available,sort_order",
        {
          method:"POST",
          headers:{Prefer:"return=representation"},
          body:JSON.stringify({
            category,
            name,
            description,
            price,
            active:true,
            available:true,
            sort_order:sortOrder,
            updated_at:new Date().toISOString()
          })
        }
      );

      const product=Array.isArray(inserted)?inserted[0]:inserted;
      if(!product?.id) return json({ok:false,error:"Produto não foi gravado no banco."},500);

      // Mantém a tabela antiga de disponibilidade sincronizada para compatibilidade.
      await supabaseRequest(
        env,
        "product_availability?on_conflict=product_id",
        {
          method:"POST",
          headers:{Prefer:"resolution=merge-duplicates,return=minimal"},
          body:JSON.stringify({
            product_id:Number(product.id),
            available:true,
            updated_at:new Date().toISOString()
          })
        }
      );

      return json({ok:true,product});
    }

    if (action === "save_catalog") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      if (!Array.isArray(body.products)) return json({ok:false,error:"Lista inválida."},400);
      for (const p of body.products) {
        const id=Number(p.id);
        if(!id) continue;
        await supabaseRequest(env,`products?id=eq.${id}`,{
          method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({
            price:Number(p.price||0),active:p.active!==false,available:p.available!==false,updated_at:new Date().toISOString()
          })
        });
      }
      return json({ok:true});
    }

    if (action === "update_products") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      if (!Array.isArray(body.products)) return json({ ok:false, error:"Lista de produtos inválida." }, 400);

      const rows = body.products.map(item => ({
        product_id:Number(item.product_id),
        available:Boolean(item.available),
        updated_at:new Date().toISOString()
      }));

      await supabaseRequest(
        env,
        "product_availability?on_conflict=product_id",
        {
          method:"POST",
          headers:{ Prefer:"resolution=merge-duplicates,return=minimal" },
          body:JSON.stringify(rows)
        }
      );
      return json({ ok:true });
    }

    if (action === "update") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);

      const id = Number(body.id);
      const allowed = {};
      if (body.status !== undefined) allowed.status = String(body.status);
      if (body.printed !== undefined) allowed.printed = Boolean(body.printed);

      await supabaseRequest(
        env,
        `orders?id=eq.${id}`,
        {
          method:"PATCH",
          headers:{ Prefer:"return=minimal" },
          body:JSON.stringify(allowed)
        }
      );
      return json({ ok:true });
    }

    return json({ ok:false, error:"Ação inválida." }, 400);
  } catch (error) {
    console.error(error);
    return json({ ok:false, error:error.message || "Erro interno." }, 500);
  }
}
