-- BEACH BURGUER V5
-- Execute este arquivo UMA VEZ no SQL Editor do Supabase atual.

create table if not exists public.product_availability (
  product_id integer primary key,
  available boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.product_availability (product_id, available)
select id, true
from generate_series(1, 27) as id
on conflict (product_id) do nothing;

alter table public.product_availability enable row level security;
