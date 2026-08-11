-- BEACH BURGUER PRODUÇÃO V27
-- Execute UMA VEZ no SQL Editor do Supabase antes de publicar a V27.
-- É seguro executar mesmo se as tabelas já existirem.

-- Presença / contador de clientes online
create table if not exists public.client_presence (
  session_id text primary key,
  last_seen timestamptz not null default now()
);
create index if not exists client_presence_last_seen_idx
  on public.client_presence(last_seen);
alter table public.client_presence enable row level security;

-- Notificações Push
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

-- Campos do endereço, mantidos por compatibilidade com V25/V26
alter table public.customers add column if not exists numero text not null default '';
alter table public.customers add column if not exists sem_numero boolean not null default false;
