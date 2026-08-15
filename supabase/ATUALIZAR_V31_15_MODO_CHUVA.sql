-- BEACH BURGUER V31.15 — MODO CHUVA
-- Execute UMA VEZ no SQL Editor do Supabase antes de publicar.

alter table public.store_state add column if not exists rain_mode boolean not null default false;
update public.store_state set rain_mode = coalesce(rain_mode,false) where id=1;
