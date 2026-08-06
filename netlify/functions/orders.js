import { getSupabase, json, authorized } from "./_shared.js";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return json(204, {});

  try {
    const supabase = getSupabase();

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const action = body.action || "create";

      if (action === "create") {
        const required = ["cliente", "telefone", "itens", "total", "pagamento", "tipo"];
        for (const field of required) {
          if (body[field] === undefined || body[field] === "" || body[field] === null) {
            return json(400, { ok: false, error: `Campo obrigatório: ${field}` });
          }
        }

        const telefone = String(body.telefone).replace(/\D/g, "");
        if (telefone.length !== 10 && telefone.length !== 11) {
          return json(400, { ok: false, error: "Telefone deve conter DDD." });
        }

        const order = {
          status: "novo",
          printed: false,
          cliente: String(body.cliente).trim(),
          telefone,
          endereco: String(body.endereco || "").trim(),
          bairro: String(body.bairro || "").trim(),
          referencia: String(body.referencia || "").trim(),
          localidade: String(body.localidade || "").trim(),
          tipo: String(body.tipo),
          pagamento: String(body.pagamento),
          troco: String(body.troco || "").trim(),
          observacoes: String(body.observacoes || "").trim(),
          itens: body.itens,
          subtotal: Number(body.subtotal || 0),
          entrega: Number(body.entrega || 0),
          total: Number(body.total || 0),
        };

        const { data, error } = await supabase
          .from("orders")
          .insert(order)
          .select()
          .single();

        if (error) throw error;

        // Saves/updates customer for future operational use.
        await supabase.from("customers").upsert(
          {
            telefone,
            nome: order.cliente,
            endereco: order.endereco,
            bairro: order.bairro,
            referencia: order.referencia,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "telefone" }
        );

        return json(200, { ok: true, order: data });
      }

      if (action === "update") {
        if (!authorized(event)) return json(401, { ok: false, error: "Não autorizado." });

        const id = Number(body.id);
        const allowed = {};
        if (body.status !== undefined) allowed.status = String(body.status);
        if (body.printed !== undefined) allowed.printed = Boolean(body.printed);

        const { error } = await supabase.from("orders").update(allowed).eq("id", id);
        if (error) throw error;
        return json(200, { ok: true });
      }

      return json(400, { ok: false, error: "Ação inválida." });
    }

    if (event.httpMethod === "GET") {
      if (!authorized(event)) return json(401, { ok: false, error: "Não autorizado." });

      const limit = Math.min(Number(event.queryStringParameters?.limit || 100), 300);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return json(200, { ok: true, orders: data || [] });
    }

    return json(405, { ok: false, error: "Método não permitido." });
  } catch (error) {
    console.error(error);
    return json(500, { ok: false, error: error.message || "Erro interno." });
  }
}
