-- Beach Burguer V31.53
-- Novo controle no cadastro de produtos: adicional obrigatório SOMENTE no Cliente.

alter table public.products
  add column if not exists required_addon boolean not null default false;

comment on column public.products.required_addon is
  'Quando true, a pagina Cliente exige pelo menos um adicional antes de adicionar o produto ao carrinho. O Garcom ignora esta regra.';
