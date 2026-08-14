
import { json, supabaseRequest, mpToken } from "./_shared.js";
import { ensureOrderFromApprovedPix } from "./_pix-order.js";

function hex(buffer) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2,"0")).join("");
}

async function validSignature(request, env, dataId) {
  const secret = env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return true;

  const sig = request.headers.get("x-signature") || "";
  const requestId = request.headers.get("x-request-id") || "";
  if (!sig || !requestId || !dataId) return false;

  let ts = "", v1 = "";
  for (const part of sig.split(",")) {
    const [k,v] = part.split("=");
    if ((k || "").trim() === "ts") ts = (v || "").trim();
    if ((k || "").trim() === "v1") v1 = (v || "").trim();
  }
  if (!ts || !v1) return false;

  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${ts};`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name:"HMAC", hash:"SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(manifest));
  return hex(signature) === v1.toLowerCase();
}

async function handle({ request, env }) {
  try {
    const url = new URL(request.url);
    let body = {};
    if (request.method === "POST") {
      try { body = await request.json(); } catch {}
    }

    const paymentId = String(
      url.searchParams.get("data.id") ||
      url.searchParams.get("data_id") ||
      body?.data?.id ||
      body?.id ||
      ""
    ).trim();

    if (!paymentId) return json({ ok:true, ignored:true });

    if (!(await validSignature(request, env, paymentId))) {
      return json({ ok:false, error:"Assinatura inválida." }, 401);
    }

    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
      { headers:{ Authorization:`Bearer ${mpToken(env)}` } }
    );
    const payment = await res.json();

    if (!res.ok) return json({ ok:true, received:true });

    await supabaseRequest(
      env,
      "pix_payments?on_conflict=payment_id",
      {
        method:"POST",
        headers:{ Prefer:"resolution=merge-duplicates,return=minimal" },
        body:JSON.stringify({
          payment_id:String(payment.id),
          external_reference:String(payment.external_reference || ""),
          status:String(payment.status || ""),
          amount:Number(payment.transaction_amount || 0),
          payer_email:String(payment.payer?.email || ""),
          updated_at:new Date().toISOString()
        })
      }
    );

    if(payment.status === "approved") {
      try { await ensureOrderFromApprovedPix(env,payment); }
      catch(e){ console.error("Webhook: criação do pedido pago falhou:",e); }
    }

    return json({ ok:true });
  } catch (error) {
    console.error(error);
    // Retorna 200 para evitar retries excessivos; o polling também confirma o pagamento.
    return json({ ok:true, warning:error.message });
  }
}

export const onRequestPost = handle;
export const onRequestGet = handle;
