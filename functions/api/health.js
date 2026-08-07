
import { json } from "./_shared.js";
export async function onRequest() {
  return json({ ok:true, service:"Beach Burguer Delivery - Cloudflare Pages" });
}
