import { json } from "./_shared.js";

export async function onRequestGet({ env }) {
  if(!env.VAPID_PUBLIC_KEY){
    return json({ok:false,error:"VAPID_PUBLIC_KEY não configurada."},500);
  }
  return json({ok:true,publicKey:env.VAPID_PUBLIC_KEY});
}
