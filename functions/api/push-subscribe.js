import { json, supabaseRequest } from "./_shared.js";

export async function onRequestOptions() {
  return json({},204);
}

export async function onRequestPost({ request, env }) {
  try{
    const body=await request.json();
    const telefone=String(body.phone||"").replace(/\D/g,"");
    const subscription=body.subscription;
    if((telefone.length!==10&&telefone.length!==11)||!subscription?.endpoint){
      return json({ok:false,error:"Dados inválidos."},400);
    }

    await supabaseRequest(
      env,
      "push_subscriptions?on_conflict=endpoint",
      {
        method:"POST",
        headers:{Prefer:"resolution=merge-duplicates,return=minimal"},
        body:JSON.stringify({
          endpoint:subscription.endpoint,
          telefone,
          subscription,
          updated_at:new Date().toISOString()
        })
      }
    );

    return json({ok:true});
  }catch(error){
    return json({ok:false,error:error.message||"Erro interno."},500);
  }
}
