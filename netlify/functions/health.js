import { json } from "./_shared.js";
export async function handler() {
  return json(200, { ok: true, service: "Beach Burguer Delivery" });
}
