import { json, authorized, supabaseRequest } from "./_shared.js";
const defaults={id:1,prize_enabled:true,wait_atafona_min:25,wait_atafona_max:35,wait_sjb_min:60,wait_sjb_max:90,wait_local_min:25,wait_local_max:30};
async function cfg(env){try{const r=await supabaseRequest(env,"operational_settings?select=*&id=eq.1&limit=1");return {...defaults,...(r?.[0]||{})}}catch{return defaults}}

function blocoDoPedido(numero){
  const n=Math.max(1,Number(numero||1));
  const inicio=Math.floor((n-1)/20)*20+1;
  return {inicio,fim:inicio+19};
}
function inteiroAleatorio(min,max){
  min=Math.ceil(Number(min)); max=Math.floor(Number(max));
  if(max<=min)return min;
  const faixa=max-min+1;
  const limite=Math.floor(0x100000000/faixa)*faixa;
  const a=new Uint32Array(1);
  let x;
  do{crypto.getRandomValues(a);x=a[0]}while(x>=limite);
  return min+(x%faixa);
}
async function sorteioDoBloco(env,nextClientNumber){
  const {inicio,fim}=blocoDoPedido(nextClientNumber);
  let rows=await supabaseRequest(env,`prize_draws?select=block_start,target_number&block_start=eq.${inicio}&limit=1`);
  let draw=rows?.[0]||null;
  if(!draw){
    // No primeiro bloco após a atualização, nunca sorteia um C# que já passou.
    // Nos blocos seguintes, nextClientNumber será o primeiro número do bloco.
    const alvo=inteiroAleatorio(Math.max(inicio,Number(nextClientNumber)),fim);
    try{
      await supabaseRequest(env,"prize_draws?on_conflict=block_start",{
        method:"POST",
        headers:{Prefer:"resolution=ignore-duplicates,return=minimal"},
        body:JSON.stringify({block_start:inicio,target_number:alvo})
      });
    }catch{}
    rows=await supabaseRequest(env,`prize_draws?select=block_start,target_number&block_start=eq.${inicio}&limit=1`);
    draw=rows?.[0]||null;
  }
  return {block_start:inicio,block_end:fim,target_number:Number(draw?.target_number||0)};
}

export async function onRequestGet({request,env}){try{
  const c=await cfg(env);
  let next_client_number=null,prize_eligible=false;
  try{
    const r=await supabaseRequest(env,"order_counters?select=last_number&origin=eq.cliente&limit=1");
    next_client_number=Number(r?.[0]?.last_number||0)+1;
    if(c.prize_enabled===true){
      const draw=await sorteioDoBloco(env,next_client_number);
      prize_eligible=draw.target_number===next_client_number;
    }
  }catch(e){console.warn("Falha ao verificar Pedido Premiado:",e?.message||e)}
  return json({ok:true,settings:c,next_client_number,prize_eligible});
}catch(e){return json({ok:false,error:e.message},500)}}

export async function onRequestPost({request,env}){try{if(!authorized(request,env))return json({ok:false,error:"Não autorizado."},401);const b=await request.json();const a=String(b.action||"");
 if(a==="settings"){return json({ok:true,settings:await cfg(env)})}
 if(a==="set_wait"||a==="reset_wait"){const row=a==="reset_wait"?{wait_atafona_min:25,wait_atafona_max:35,wait_sjb_min:60,wait_sjb_max:90,wait_local_min:25,wait_local_max:30}:{wait_atafona_min:Number(b.wait_atafona_min),wait_atafona_max:Number(b.wait_atafona_max),wait_sjb_min:Number(b.wait_sjb_min),wait_sjb_max:Number(b.wait_sjb_max),wait_local_min:Number(b.wait_local_min),wait_local_max:Number(b.wait_local_max)};row.updated_at=new Date().toISOString();await supabaseRequest(env,"operational_settings?id=eq.1",{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify(row)});return json({ok:true,settings:await cfg(env)})}
 if(a==="set_prize"){await supabaseRequest(env,"operational_settings?id=eq.1",{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({prize_enabled:Boolean(b.enabled),updated_at:new Date().toISOString()})});return json({ok:true,settings:await cfg(env)})}
 if(a==="costs"){const products=await supabaseRequest(env,"products?select=id,name,category,price,active&active=eq.true&order=category.asc,sort_order.asc,id.asc");const costs=await supabaseRequest(env,"product_costs?select=product_id,cost");const m=Object.fromEntries((costs||[]).map(x=>[x.product_id,Number(x.cost||0)]));return json({ok:true,products:(products||[]).map(p=>({...p,cost:m[p.id]||0}))})}
 if(a==="save_cost"){const id=Number(b.product_id),cost=Math.max(0,Number(b.cost||0));await supabaseRequest(env,"product_costs?on_conflict=product_id",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({product_id:id,cost,updated_at:new Date().toISOString()})});return json({ok:true})}
 return json({ok:false,error:"Ação inválida."},400)}catch(e){console.error(e);return json({ok:false,error:e.message||"Erro interno."},500)}}
