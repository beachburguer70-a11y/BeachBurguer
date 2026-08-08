import { sendNotification } from "web-push-neo";

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


async function sendWhatsAppTemplate(env, telefone, templateName, nomeCliente, orderId) {
  const token = env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId || !templateName || !telefone) {
    return { ok:false, skipped:true, reason:"WhatsApp não configurado." };
  }

  let to = String(telefone || "").replace(/\D/g, "");
  if (to.length === 10 || to.length === 11) to = "55" + to;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: env.WHATSAPP_LANGUAGE_CODE || "pt_BR" },
      components: [{
        type: "body",
        parameters: [
          { type: "text", text: String(nomeCliente || "Cliente") },
          { type: "text", text: String(orderId || "") }
        ]
      }]
    }
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${encodeURIComponent(phoneNumberId)}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );
    const data = await response.json();
    if (!response.ok) {
      console.warn("WhatsApp não enviado:", data);
      return { ok:false, error:data?.error?.message || "Falha no WhatsApp." };
    }
    return { ok:true, data };
  } catch (error) {
    console.warn("Erro ao enviar WhatsApp:", error);
    return { ok:false, error:error.message };
  }
}


async function enviarPushPedido(env, telefone, pedido) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    console.warn("PUSH: chaves VAPID ausentes.");
    return {ok:false,error:"Chaves VAPID ausentes."};
  }

  const phone=String(telefone||"").replace(/\D/g,"");
  if(!phone) return {ok:false,error:"Telefone ausente."};

  const rows=await supabaseRequest(
    env,
    `push_subscriptions?select=endpoint,subscription&telefone=eq.${phone}`
  );

  console.log(`PUSH: telefone ${phone}, assinaturas encontradas: ${(rows||[]).length}`);

  if(!(rows||[]).length){
    return {ok:false,error:"Nenhuma assinatura encontrada para este telefone."};
  }

  const entrega=String(pedido?.tipo||"").trim().toLowerCase()==="entrega";
  const payload=JSON.stringify({
    title:"Beach Burguer",
    body:entrega ? "🛵 Seu pedido está a caminho!" : "🍔 Seu pedido está pronto!",
    url:"/?meus-pedidos=1",
    tag:`pedido-${pedido?.id||""}-pronto`
  });

  let enviados=0;
  let erros=[];

  for(const row of rows||[]){
    try{
      const result = await sendNotification(row.subscription, payload, {
        vapidDetails: {
          subject: env.VAPID_SUBJECT || "mailto:contato@beachburguer.local",
          publicKey: env.VAPID_PUBLIC_KEY,
          privateKey: env.VAPID_PRIVATE_KEY
        },
        TTL: 120,
        urgency: "high",
        topic: `pedido-${pedido?.id || "novo"}`.slice(0,32)
      });
      enviados++;
      console.log("PUSH enviado com sucesso:", phone, result?.statusCode || "ok");
    }catch(error){
      const status=Number(error?.statusCode||0);
      const msg=String(error?.message||error);
      console.warn("PUSH falhou:",status,msg);
      erros.push({status,message:msg});

      if(status===404||status===410){
        try{
          await supabaseRequest(
            env,
            `push_subscriptions?endpoint=eq.${encodeURIComponent(row.endpoint)}`,
            {method:"DELETE"}
          );
        }catch{}
      }
    }
  }

  return {ok:enviados>0,enviados,erros};
}
export async function onRequestOptions() {
  return json({}, 204);
}

export async function onRequestGet({ request, env }) {
  try {
    const url=new URL(request.url);
    const phone=String(url.searchParams.get("phone")||"").replace(/\D/g,"");
    if(phone){
      if(phone.length!==10&&phone.length!==11){
        return json({ok:false,error:"Telefone inválido."},400);
      }
      const orders=await supabaseRequest(
        env,
        `orders?select=id,created_at,status,cliente,telefone,tipo,itens,total&telefone=eq.${phone}&order=created_at.desc&limit=30`
      );
      return json({ok:true,orders:orders||[]});
    }
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
        pix_status:pixPayment ? String(pixPayment.status) : null,
        origem:isGarcom ? "garcom" : "cliente"
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

      // Pedido do cliente: tenta enviar confirmação automática pelo WhatsApp.
      // A falha do WhatsApp nunca impede o pedido de ser criado.
      if (!isGarcom && telefone) {
        await sendWhatsAppTemplate(
          env,
          telefone,
          env.WHATSAPP_TEMPLATE_PEDIDO_ACEITO || "bb_pedido_aceito",
          order.cliente,
          saved?.id
        );
      }

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


    if (action === "edit_waiter_order") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      const id=Number(body.id);
      if(!id) return json({ok:false,error:"Pedido inválido."},400);
      if(!String(body.cliente||"").trim()) return json({ok:false,error:"Informe o nome do cliente."},400);
      if(!Array.isArray(body.itens)||!body.itens.length) return json({ok:false,error:"O pedido precisa ter pelo menos um item."},400);

      const rows=await supabaseRequest(env,`orders?select=id,origem&id=eq.${id}&limit=1`);
      const atual=Array.isArray(rows)?rows[0]:null;
      if(!atual) return json({ok:false,error:"Pedido não encontrado."},404);
      if(String(atual.origem||"")!=="garcom") return json({ok:false,error:"Somente pedidos do garçom podem ser editados nesta tela."},400);

      const alterado={
        cliente:String(body.cliente).trim(),
        localidade:String(body.tipo||"Consumir no local"),
        tipo:String(body.tipo||"Consumir no local"),
        pagamento:String(body.pagamento||"A pagar"),
        observacoes:String(body.observacoes||"").trim(),
        itens:body.itens,
        subtotal:Number(body.subtotal||0),
        entrega:0,
        total:Number(body.total||0),
        printed:false
      };
      const updated=await supabaseRequest(env,`orders?id=eq.${id}&select=*`,{
        method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify(alterado)
      });
      return json({ok:true,order:Array.isArray(updated)?updated[0]:updated,reprint:true});
    }

    if (action === "update") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);

      const id = Number(body.id);
      const beforeRows = await supabaseRequest(
        env,
        `orders?select=id,status,cliente,telefone,origem,tipo&id=eq.${id}&limit=1`
      );
      const before = Array.isArray(beforeRows) ? beforeRows[0] : null;

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

      // V8.36: todo clique explícito em "Pronto" tenta enviar a notificação.
      // Isso também permite refazer o envio caso o pedido já estivesse marcado como pronto.
      let pushResult=null;
      if (
        String(body.status || "") === "pronto" &&
        before &&
        String(before.origem || "cliente") !== "garcom" &&
        before.telefone
      ) {
        // WhatsApp permanece opcional; falha nele não bloqueia o Web Push.
        try{
          await sendWhatsAppTemplate(
            env,
            before.telefone,
            env.WHATSAPP_TEMPLATE_PEDIDO_CAMINHO || "bb_pedido_a_caminho",
            before.cliente,
            before.id
          );
        }catch(e){
          console.warn("WhatsApp ignorado:",e?.message||e);
        }

        try{
          pushResult=await enviarPushPedido(env,before.telefone,before);
        }catch(e){
          console.error("Erro geral no PUSH:",e);
          pushResult={ok:false,error:e?.message||String(e)};
        }
      }

      return json({ ok:true, push:pushResult });
    }

    return json({ ok:false, error:"Ação inválida." }, 400);
  } catch (error) {
    console.error(error);
    return json({ ok:false, error:error.message || "Erro interno." }, 500);
  }
}
