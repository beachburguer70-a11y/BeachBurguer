-- BEACH BURGUER V8.31 — MEUS PEDIDOS + NOTIFICAÇÕES PUSH
-- Execute UMA VEZ no SQL Editor do Supabase.

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  telefone text not null,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_telefone_idx
  on public.push_subscriptions(telefone);

alter table public.push_subscriptions enable row level security;
