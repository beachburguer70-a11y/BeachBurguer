
import { json, supabaseRequest, mpToken } from "./_shared.js";

function uuid() {
  return crypto.randomUUID();
}

export async function onRequestOptions() {
  return json({}, 204);
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const email = String(body.email || "").trim();
    const name = String(body.name || "").trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      return json({ ok:false, error:"Valor inválido." }, 400);
    }
    if (!email || !email.includes("@")) {
      return json({ ok:false, error:"E-mail inválido." }, 400);
    }

    const idempotencyKey = uuid();
    const externalReference = `BB-${Date.now()}-${uuid().slice(0,8)}`;
    const origin = new URL(request.url).origin;

    const payload = {
      transaction_amount:Number(amount.toFixed(2)),
      description:"Pedido Beach Burguer",
      payment_method_id:"pix",
      external_reference:externalReference,
      notification_url:`${origin}/api/mercadopago-webhook`,
      payer:{ email, first_name:name || "Cliente" }
    };

    const res = await fetch("https://api.mercadopago.com/v1/payments", {
      method:"POST",
      headers:{
        Authorization:`Bearer ${mpToken(env)}`,
        "Content-Type":"application/json",
        "X-Idempotency-Key":idempotencyKey
      },
      body:JSON.stringify(payload)
    });

    const payment = await res.json();

    if (!res.ok) {
      console.error("Mercado Pago create:", payment);
      return json({
        ok:false,
        error:payment.message || "Mercado Pago recusou a criação do Pix.",
        details:payment.cause || []
      }, res.status);
    }

    const qrCode = payment?.point_of_interaction?.transaction_data?.qr_code;
    const qrBase64 = payment?.point_of_interaction?.transaction_data?.qr_code_base64;
    if (!qrCode) {
      return json({ ok:false, error:"Mercado Pago não retornou o código Pix." }, 502);
    }

    try {
      await supabaseRequest(
        env,
        "pix_payments?on_conflict=payment_id",
        {
          method:"POST",
          headers:{ Prefer:"resolution=merge-duplicates,return=minimal" },
          body:JSON.stringify({
            payment_id:String(payment.id),
            external_reference:externalReference,
            status:String(payment.status || "pending"),
            amount:Number(amount.toFixed(2)),
            payer_email:email,
            qr_code:qrCode,
            updated_at:new Date().toISOString()
          })
        }
      );
    } catch (dbError) {
      console.warn("Pix criado, mas registro pix_payments falhou:", dbError.message);
    }

    return json({
      ok:true,
      payment_id:String(payment.id),
      external_reference:externalReference,
      status:String(payment.status || ""),
      qr_code:qrCode,
      qr_code_base64:qrBase64 || null,
      amount:Number(amount.toFixed(2))
    });
  } catch (error) {
    console.error(error);
    return json({ ok:false, error:error.message || "Erro ao gerar Pix." }, 500);
  }
}
