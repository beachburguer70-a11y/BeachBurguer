-- BEACH BURGUER V8.47 — FINALIZAR EXPEDIENTE
-- Execute UMA VEZ no SQL Editor do Supabase.

create table if not exists public.store_state (
  id integer primary key,
  shift_started_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.store_state (id, shift_started_at, updated_at)
values (1, null, now())
on conflict (id) do nothing;

alter table public.store_state enable row level security;
