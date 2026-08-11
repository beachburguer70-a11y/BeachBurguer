import { json, authorized, supabaseRequest } from "./_shared.js";
export async function onRequestOptions(){return json({},204);}
export async function onRequestPost({request,env}){
 try{const b=await request.json(); const id=String(b.session_id||"").slice(0,120); if(!id)return json({ok:false},400);
 await supabaseRequest(env,"client_presence?on_conflict=session_id",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({session_id:id,last_seen:new Date().toISOString()})});
 return json({ok:true});}catch(e){return json({ok:false,error:e.message},500);}
}
export async function onRequestGet({request,env}){
 try{if(!authorized(request,env))return json({ok:false,error:"Não autorizado."},401);
 const cutoff=new Date(Date.now()-60000).toISOString();
 const rows=await supabaseRequest(env,`client_presence?select=session_id&last_seen=gte.${encodeURIComponent(cutoff)}`);
 return json({ok:true,online:(rows||[]).length});}catch(e){return json({ok:false,error:e.message},500);}
}
