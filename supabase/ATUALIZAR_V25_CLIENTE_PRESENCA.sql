-- V25 - cliente recorrente + numero do endereco + presenca online
alter table public.customers add column if not exists numero text not null default '';
alter table public.customers add column if not exists sem_numero boolean not null default false;

create table if not exists public.client_presence (
  session_id text primary key,
  last_seen timestamptz not null default now()
);
create index if not exists client_presence_last_seen_idx on public.client_presence(last_seen);
alter table public.client_presence enable row level security;
