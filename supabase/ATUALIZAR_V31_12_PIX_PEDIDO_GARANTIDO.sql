-- BEACH BURGUER V31.12 — PIX APROVADO SEM PEDIDO
-- Execute UMA VEZ no SQL Editor do Supabase antes de publicar a V31.12.

alter table public.pix_payments
  add column if not exists order_payload jsonb,
  add column if not exists order_created_id bigint;

create index if not exists pix_payments_order_created_id_idx
  on public.pix_payments (order_created_id);
