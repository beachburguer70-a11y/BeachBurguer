-- V31.35 - Melhorias completas: tempos, pedido premiado, numeração, desconto e custos
create table if not exists public.operational_settings (
  id bigint primary key default 1 check (id=1),
  prize_enabled boolean not null default true,
  wait_atafona_min int not null default 25,
  wait_atafona_max int not null default 35,
  wait_sjb_min int not null default 60,
  wait_sjb_max int not null default 90,
  wait_local_min int not null default 25,
  wait_local_max int not null default 30,
  updated_at timestamptz not null default now()
);
insert into public.operational_settings(id) values(1) on conflict(id) do nothing;

create table if not exists public.order_counters (
  origin text primary key,
  last_number bigint not null default 0
);
insert into public.order_counters(origin,last_number) values
 ('cliente',(select count(*) from public.orders where coalesce(origem,'cliente')<>'garcom')),
 ('garcom',(select count(*) from public.orders where origem='garcom'))
on conflict(origin) do nothing;

alter table public.orders add column if not exists display_number bigint;
alter table public.orders add column if not exists discount_amount numeric(12,2) not null default 0;
alter table public.orders add column if not exists prize_awarded boolean not null default false;

create or replace function public.assign_display_number() returns trigger language plpgsql as $$
declare k text; n bigint;
begin
  k := case when new.origem='garcom' then 'garcom' else 'cliente' end;
  insert into public.order_counters(origin,last_number) values(k,1)
  on conflict(origin) do update set last_number=public.order_counters.last_number+1
  returning last_number into n;
  new.display_number := n;
  return new;
end $$;
drop trigger if exists trg_assign_display_number on public.orders;
create trigger trg_assign_display_number before insert on public.orders
for each row when (new.display_number is null) execute function public.assign_display_number();

create table if not exists public.product_costs (
  product_id bigint primary key references public.products(id) on delete cascade,
  cost numeric(12,2) not null default 0,
  updated_at timestamptz not null default now()
);
