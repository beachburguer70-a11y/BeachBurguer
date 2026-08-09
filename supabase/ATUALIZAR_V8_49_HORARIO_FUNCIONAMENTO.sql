-- BEACH BURGUER V8.49 — HORÁRIO DE FUNCIONAMENTO
-- Execute UMA VEZ no SQL Editor do Supabase.

alter table public.store_state
  add column if not exists opening_hours jsonb,
  add column if not exists manual_mode text default 'auto',
  add column if not exists manual_date date;

update public.store_state
set opening_hours = coalesce(opening_hours, '{
  "0":{"enabled":true,"open":"19:00","close":"23:00"},
  "1":{"enabled":false,"open":"19:00","close":"23:00"},
  "2":{"enabled":false,"open":"19:00","close":"23:00"},
  "3":{"enabled":true,"open":"19:00","close":"23:00"},
  "4":{"enabled":true,"open":"19:00","close":"23:00"},
  "5":{"enabled":true,"open":"19:00","close":"23:00"},
  "6":{"enabled":true,"open":"19:00","close":"23:00"}
}'::jsonb),
manual_mode = coalesce(manual_mode,'auto')
where id=1;
