-- BEACH BURGUER V8.6 — PIX AUTOMÁTICO MERCADO PAGO
-- Execute UMA VEZ no SQL Editor do Supabase.

alter table public.orders
  add column if not exists pix_payment_id text,
  add column if not exists pix_status text;

create unique index if not exists orders_pix_payment_id_unique
  on public.orders (pix_payment_id)
  where pix_payment_id is not null;

create table if not exists public.pix_payments (
  payment_id text primary key,
  external_reference text not null default '',
  status text not null default 'pending',
  amount numeric(10,2) not null default 0,
  payer_email text not null default '',
  qr_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pix_payments_status_idx
  on public.pix_payments (status);

alter table public.pix_payments enable row level security;
