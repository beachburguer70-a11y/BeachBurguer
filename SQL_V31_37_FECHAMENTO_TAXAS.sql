-- V31.37 - taxas e recebimento de A pagar no fechamento
alter table public.cash_closings add column if not exists apagar_cash numeric(12,2) not null default 0;
alter table public.cash_closings add column if not exists apagar_card numeric(12,2) not null default 0;
alter table public.cash_closings add column if not exists card_fee numeric(12,2) not null default 0;
alter table public.cash_closings add column if not exists pix_fee numeric(12,2) not null default 0;
