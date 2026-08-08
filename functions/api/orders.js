
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
    // Público: somente disponibilidade dos produtos
    const products = await supabaseRequest(
      env,
      "product_availability?select=product_id,available,updated_at&order=product_id.asc"
    );
    return json({ ok:true, products:products || [] });
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
      const required = ["cliente","telefone","itens","total","pagamento","tipo"];
      for (const field of required) {
        if (body[field] === undefined || body[field] === "" || body[field] === null) {
          return json({ ok:false, error:`Campo obrigatório: ${field}` }, 400);
        }
      }

      const telefone = String(body.telefone).replace(/\D/g, "");
      if (telefone.length !== 10 && telefone.length !== 11) {
        return json({ ok:false, error:"Telefone deve conter DDD." }, 400);
      }

      if (!Array.isArray(body.itens) || !body.itens.length) {
        return json({ ok:false, error:"Adicione pelo menos um produto ao pedido." }, 400);
      }

      const temLanche = body.itens.some(item =>
        String(item?.categoria || "").trim().toLowerCase() !== "bebidas" &&
        String(item?.categoria || "").trim() !== ""
      );

      if (!temLanche) {
        return json({
          ok:false,
          error:"Para finalizar o pedido, é obrigatório escolher pelo menos 1 lanche. Não é permitido pedir somente bebidas."
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
      );

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
      const products = await supabaseRequest(
        env,
        "product_availability?select=product_id,available,updated_at&order=product_id.asc"
      );
      return json({ ok:true, products:products || [] });
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
