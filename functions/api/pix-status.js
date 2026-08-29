
import { json, supabaseRequest, mpToken } from "./_shared.js";
import { ensureOrderFromApprovedPix } from "./_pix-order.js";

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

    const externalReference=String(payment.external_reference||"");
    const isPixTest=externalReference.startsWith("BB-TEST-");

    // V31.23: o cliente informa explicitamente que já efetuou o Pix.
    // Se, após a janela de confirmação do navegador, o Mercado Pago ainda
    // responder pending_waiting_transfer, bloqueia somente o Pix automático.
    const confirmAttempt=new URL(request.url).searchParams.get("confirm_attempt")==="1";
    let pixAutoDisabled=false;
    if(!isPixTest && confirmAttempt && String(payment.status||"")==="pending" && String(payment.status_detail||"")==="pending_waiting_transfer"){
      try{
        await supabaseRequest(env,"store_state?on_conflict=id",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({id:1,pix_operational:false,pix_test_status:"real_payment_not_confirmed",pix_test_status_detail:`Pagamento real ${String(payment.id)} informado como pago, mas não confirmado pelo Mercado Pago.`,pix_last_test_at:new Date().toISOString(),updated_at:new Date().toISOString()})});
        pixAutoDisabled=true;
      }catch(e){ console.warn("Falha ao bloquear Pix automático:",e?.message||e); }
    }

    if(isPixTest){
      const status=String(payment.status||"");
      const detail=String(payment.status_detail||"");
      const terminalProblem=["rejected","cancelled","refunded","charged_back"].includes(status);
      const patch={
        id:1,
        pix_test_payment_id:String(payment.id),
        pix_test_status:status,
        pix_test_status_detail:detail,
        pix_last_test_at:new Date().toISOString(),
        updated_at:new Date().toISOString()
      };
      if(status==="approved"){
        patch.pix_last_approved_at=new Date().toISOString();
      }else if(terminalProblem){
        patch.pix_operational=false;
      }
      try{
        await supabaseRequest(env,"store_state?on_conflict=id",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(patch)});
      }catch(e){ console.warn("Teste Pix: estado da loja não atualizado:",e?.message||e); }
    }

    let orderResult=null;
    if(!isPixTest && payment.status === "approved") {
      try { orderResult=await ensureOrderFromApprovedPix(env,payment); }
      catch(e){ console.error("Reconciliação Pix/pedido falhou:",e); }
    }

    return json({
      ok:true,
      payment_id:String(payment.id),
      status:String(payment.status || ""),
      status_detail:String(payment.status_detail || ""),
      approved:payment.status === "approved",
      amount:Number(payment.transaction_amount || 0),
      external_reference:String(payment.external_reference || ""),
      order_id:orderResult?.order?.id || null,
      order_created:Boolean(orderResult?.order),
      pix_auto_disabled:pixAutoDisabled
    });
  } catch (error) {
    console.error(error);
    return json({ ok:false, error:error.message || "Erro ao consultar Pix." }, 500);
  }
}
