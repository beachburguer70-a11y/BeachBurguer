
-- BEACH BURGUER V8.30
-- Execute UMA VEZ no SQL Editor do Supabase.
alter table public.orders
  add column if not exists origem text not null default 'cliente';

-- Pedidos antigos permanecem como cliente.
update public.orders
set origem = 'cliente'
where origem is null or origem = '';
