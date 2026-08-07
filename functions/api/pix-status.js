
import { json, supabaseRequest, mpToken } from "./_shared.js";

export async function onRequestOptions() {
  return json({}, 204);
}

export async function onRequestGet({ request, env }) {
  try {
    const paymentId = new URL(request.url).searchParams.get("payment_id") || "";
    if (!paymentId) return json({ ok:false, error:"payment_id obrigatório." }, 400);

    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
      { headers:{ Authorization:`Bearer ${mpToken(env)}` } }
    );
    const payment = await res.json();

    if (!res.ok) {
      return json({ ok:false, error:payment.message || "Pagamento não encontrado." }, res.status);
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
            external_reference:String(payment.external_reference || ""),
            status:String(payment.status || ""),
            amount:Number(payment.transaction_amount || 0),
            payer_email:String(payment.payer?.email || ""),
            updated_at:new Date().toISOString()
          })
        }
      );
    } catch (dbError) {
      console.warn("Status MP OK; banco falhou:", dbError.message);
    }

    return json({
      ok:true,
      payment_id:String(payment.id),
      status:String(payment.status || ""),
      status_detail:String(payment.status_detail || ""),
      approved:payment.status === "approved",
      amount:Number(payment.transaction_amount || 0),
      external_reference:String(payment.external_reference || "")
    });
  } catch (error) {
    console.error(error);
    return json({ ok:false, error:error.message || "Erro ao consultar Pix." }, 500);
  }
}
