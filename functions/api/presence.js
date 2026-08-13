import { json, authorized, supabaseRequest } from "./_shared.js";

export async function onRequestOptions(){return json({},204);}

export async function onRequestPost({request,env}){
  try{
    const b=await request.json();
    const id=String(b.session_id||"").trim().slice(0,120);
    if(!id)return json({ok:false,error:"Sessão inválida."},400);

    await supabaseRequest(
      env,
      "client_presence?on_conflict=session_id",
      {
        method:"POST",
        headers:{Prefer:"resolution=merge-duplicates,return=minimal"},
        body:JSON.stringify({session_id:id,last_seen:new Date().toISOString()})
      }
    );
    // V31: registra uma única visita por dispositivo/sessão por dia no horário de Brasília.
    const dateBR=new Intl.DateTimeFormat("en-CA",{
      timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit"
    }).format(new Date());
    await supabaseRequest(
      env,
      "client_daily_visits?on_conflict=visit_date,session_id",
      {
        method:"POST",
        headers:{Prefer:"resolution=merge-duplicates,return=minimal"},
        body:JSON.stringify({
          visit_date:dateBR,
          session_id:id,
          last_seen:new Date().toISOString()
        })
      }
    );
    return json({ok:true});
  }catch(e){
    console.error("PRESENCE POST:",e);
    return json({ok:false,error:"Contador online ainda não foi configurado no banco."},500);
  }
}

export async function onRequestGet({request,env}){
  try{
    if(!authorized(request,env))return json({ok:false,error:"Não autorizado."},401);

    const cutoff=new Date(Date.now()-45000).toISOString();
    const rows=await supabaseRequest(
      env,
      `client_presence?select=session_id,last_seen&last_seen=gte.${encodeURIComponent(cutoff)}`
    );

    // Limpeza oportunista de sessões antigas para a tabela não crescer indefinidamente.
    const velho=new Date(Date.now()-24*60*60*1000).toISOString();
    supabaseRequest(
      env,
      `client_presence?last_seen=lt.${encodeURIComponent(velho)}`,
      {method:"DELETE"}
    ).catch(()=>{});

    return json({ok:true,online:(rows||[]).length});
  }catch(e){
    console.error("PRESENCE GET:",e);
    return json({ok:false,error:"Contador online ainda não foi configurado no banco."},500);
  }
}
