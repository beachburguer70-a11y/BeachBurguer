-- BEACH BURGUER V30.2
-- Execute UMA VEZ no SQL Editor do Supabase.
-- Faz os clientes que já possuem pedidos anteriores aparecerem imediatamente.

insert into public.customers
  (telefone,nome,endereco,bairro,referencia,updated_at)
select distinct on (regexp_replace(coalesce(telefone,''),'\D','','g'))
  regexp_replace(coalesce(telefone,''),'\D','','g') as telefone,
  coalesce(cliente,'') as nome,
  coalesce(endereco,'') as endereco,
  coalesce(bairro,'') as bairro,
  coalesce(referencia,'') as referencia,
  coalesce(created_at,now()) as updated_at
from public.orders
where length(regexp_replace(coalesce(telefone,''),'\D','','g')) in (10,11)
order by regexp_replace(coalesce(telefone,''),'\D','','g'), created_at desc
on conflict (telefone) do update set
  nome=excluded.nome,
  endereco=case when excluded.endereco<>'' then excluded.endereco else public.customers.endereco end,
  bairro=case when excluded.bairro<>'' then excluded.bairro else public.customers.bairro end,
  referencia=case when excluded.referencia<>'' then excluded.referencia else public.customers.referencia end,
  updated_at=greatest(public.customers.updated_at,excluded.updated_at);
