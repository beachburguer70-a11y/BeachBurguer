import { json, authorized, supabaseRequest, mpToken } from "./_shared.js";

function uuid(){ return crypto.randomUUID(); }

async function saveState(env, patch){
  await supabaseRequest(env,"store_state?on_conflict=id",{
    method:"POST",
    headers:{Prefer:"resolution=merge-duplicates,return=minimal"},
    body:JSON.stringify({id:1,...patch,updated_at:new Date().toISOString()})
  });
}

async function getState(env){
  const rows=await supabaseRequest(env,"store_state?select=id,pix_operational,pix_test_payment_id,pix_test_status,pix_test_status_detail,pix_test_started_at,pix_last_test_at,pix_last_approved_at,pix_manual_key&id=eq.1&limit=1");
  return rows?.[0]||{};
}

export async function onRequestOptions(){ return json({},204); }

export async function onRequestPost({request,env}){
  if(!authorized(request,env)) return json({ok:false,error:"Não autorizado."},401);
  try{
    const body=await request.json().catch(()=>({}));
    const action=String(body.action||"start");

    if(action==="state"){
      return json({ok:true,state:await getState(env)});
    }

    if(action==="set_operational"){
      const enabled=body.enabled===true;
      await saveState(env,{pix_operational:enabled,pix_test_status:enabled?"manual_enabled":"manual_disabled",pix_test_status_detail:""});
      return json({ok:true,state:await getState(env)});
    }

    if(action==="set_manual_key"){
      const key=String(body.pix_manual_key||"").trim();
      if(!key)return json({ok:false,error:"Informe a chave Pix manual."},400);
      if(key.length>180)return json({ok:false,error:"Chave Pix manual muito longa."},400);
      await saveState(env,{pix_manual_key:key});
      return json({ok:true,state:await getState(env)});
    }

    if(action==="check"){
      const state=await getState(env);
      const paymentId=String(body.payment_id||state.pix_test_payment_id||"").trim();
      if(!paymentId)return json({ok:false,error:"Nenhum teste Pix em andamento."},400);
      const res=await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,{headers:{Authorization:`Bearer ${mpToken(env)}`}});
      const payment=await res.json();
      if(!res.ok)return json({ok:false,error:payment.message||"Não foi possível consultar o teste Pix."},res.status);

      const status=String(payment.status||"");
      const detail=String(payment.status_detail||"");
      const startedAt=state.pix_test_started_at?new Date(state.pix_test_started_at).getTime():Date.now();
      const elapsedMs=Math.max(0,Date.now()-startedAt);
      const timeoutProblem=status==="pending" && elapsedMs>=3*60*1000;
      const terminalProblem=["rejected","cancelled","refunded","charged_back"].includes(status);
      const patch={pix_test_payment_id:String(payment.id),pix_test_status:timeoutProblem?"failed_timeout":status,pix_test_status_detail:timeoutProblem?`${detail||"pending"} | sem aprovação após 3 minutos`:detail,pix_last_test_at:new Date().toISOString()};
      if(status==="approved"){
        patch.pix_last_approved_at=new Date().toISOString();
      }else if(terminalProblem||timeoutProblem){
        patch.pix_operational=false;
      }
      await saveState(env,patch);
      return json({ok:true,payment_id:String(payment.id),status:patch.pix_test_status,status_detail:patch.pix_test_status_detail,approved:status==="approved",pix_operational:patch.pix_operational ?? state.pix_operational!==false,elapsed_ms:elapsedMs,state:await getState(env)});
    }

    if(action!=="start")return json({ok:false,error:"Ação inválida."},400);

    const amount=Number(env.PIX_TEST_AMOUNT||15.00);
    if(!Number.isFinite(amount)||amount<=0)return json({ok:false,error:"PIX_TEST_AMOUNT inválido."},500);
    const origin=new URL(request.url).origin;
    const externalReference=`BB-TEST-${Date.now()}-${uuid().slice(0,8)}`;
    const startedAt=new Date().toISOString();
    const payload={
      transaction_amount:Number(amount.toFixed(2)),
      description:"Teste Pix Beach Burguer",
      payment_method_id:"pix",
      external_reference:externalReference,
      notification_url:`${origin}/api/mercadopago-webhook`,
      payer:{email:`teste.pix.${Date.now()}@beachburguer.pages.dev`,first_name:"Teste Pix"}
    };
    const res=await fetch("https://api.mercadopago.com/v1/payments",{
      method:"POST",
      headers:{Authorization:`Bearer ${mpToken(env)}`,"Content-Type":"application/json","X-Idempotency-Key":uuid()},
      body:JSON.stringify(payload)
    });
    const payment=await res.json();
    if(!res.ok)return json({ok:false,error:payment.message||"Mercado Pago recusou o teste Pix.",details:payment.cause||[]},res.status);
    const qrCode=payment?.point_of_interaction?.transaction_data?.qr_code;
    const qrBase64=payment?.point_of_interaction?.transaction_data?.qr_code_base64;
    if(!qrCode)return json({ok:false,error:"Mercado Pago não retornou o QR Code do teste."},502);

    try{
      await supabaseRequest(env,"pix_payments?on_conflict=payment_id",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({payment_id:String(payment.id),external_reference:externalReference,status:String(payment.status||"pending"),amount:Number(amount.toFixed(2)),payer_email:String(payment.payer?.email||""),qr_code:qrCode,order_payload:null,updated_at:new Date().toISOString()})});
    }catch(e){console.warn("Registro teste Pix:",e?.message||e);}

    await saveState(env,{pix_test_payment_id:String(payment.id),pix_test_status:String(payment.status||"pending"),pix_test_status_detail:String(payment.status_detail||""),pix_test_started_at:startedAt,pix_last_test_at:startedAt});
    return json({ok:true,payment_id:String(payment.id),status:String(payment.status||"pending"),status_detail:String(payment.status_detail||""),amount:Number(amount.toFixed(2)),qr_code:qrCode,qr_code_base64:qrBase64||null,state:await getState(env)});
  }catch(error){
    console.error(error);
    const msg=String(error?.message||"Erro no teste Pix.");
    if(/column|schema cache|pix_operational|pix_test_|pix_manual_key/i.test(msg))return json({ok:false,error:"Execute primeiro o SQL ATUALIZAR_V31_19_TESTE_PIX.sql no Supabase."},500);
    return json({ok:false,error:msg},500);
  }
}
