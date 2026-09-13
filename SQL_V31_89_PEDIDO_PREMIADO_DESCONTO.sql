-- V31.89 - Percentual configurável do Pedido Premiado
alter table public.operational_settings
  add column if not exists prize_discount_percent numeric(5,2) not null default 30;

alter table public.operational_settings
  drop constraint if exists operational_settings_prize_discount_percent_check;
alter table public.operational_settings
  add constraint operational_settings_prize_discount_percent_check
  check (prize_discount_percent >= 0 and prize_discount_percent <= 100);

update public.operational_settings
set prize_discount_percent=30
where prize_discount_percent is null;

alter table public.operational_settings enable row level security;
