-- V31.88 - Destinação de adicionais por PRODUTO + correção/garantia de estoque
-- Execute este SQL no Supabase antes de testar a nova função.

-- 1) Cada adicional pode ser destinado a produtos específicos.
--    [] = aparece em todos os produtos (mantém compatibilidade com os adicionais atuais).
alter table public.addons
  add column if not exists target_product_ids jsonb not null default '[]'::jsonb;

alter table public.required_addons
  add column if not exists target_product_ids jsonb not null default '[]'::jsonb;

-- 2) Estoque por produto.
--    NULL = ilimitado | 0 = esgotado | inteiro positivo = quantidade disponível.
alter table public.products
  add column if not exists stock_quantity integer;

alter table public.products
  drop constraint if exists products_stock_quantity_nonnegative;
alter table public.products
  add constraint products_stock_quantity_nonnegative
  check (stock_quantity is null or stock_quantity >= 0);

-- 3) Função/trigger: baixa estoque ao criar pedido, ajusta ao editar e devolve ao cancelar/excluir.
--    O FOR UPDATE impede duas vendas concorrentes de consumirem a mesma unidade.
create or replace function public.adjust_product_stock_from_order()
returns trigger
language plpgsql
as $$
declare
  item record;
  q integer;
  current_stock integer;
begin
  if tg_op = 'INSERT' then
    for item in
      select (x->>'id')::bigint as product_id,
             greatest(1, coalesce((x->>'quantidade')::integer,1)) as qty
      from jsonb_array_elements(coalesce(new.itens,'[]'::jsonb)) x
      where (x->>'id') ~ '^\d+$'
    loop
      q := item.qty;
      select stock_quantity into current_stock
      from public.products
      where id=item.product_id
      for update;

      if current_stock is not null then
        if current_stock < q then
          raise exception 'Produto sem estoque suficiente (produto %). Disponível: %, solicitado: %',
            item.product_id, current_stock, q using errcode='P0001';
        end if;
        update public.products
        set stock_quantity=stock_quantity-q, updated_at=now()
        where id=item.product_id;
      end if;
    end loop;
    return new;

  elsif tg_op = 'DELETE' then
    for item in
      select (x->>'id')::bigint as product_id,
             greatest(1, coalesce((x->>'quantidade')::integer,1)) as qty
      from jsonb_array_elements(coalesce(old.itens,'[]'::jsonb)) x
      where (x->>'id') ~ '^\d+$'
    loop
      update public.products
      set stock_quantity=stock_quantity+item.qty, updated_at=now()
      where id=item.product_id and stock_quantity is not null;
    end loop;
    return old;

  elsif tg_op = 'UPDATE' then
    if new.itens is not distinct from old.itens then return new; end if;

    -- Devolve o estoque anterior.
    for item in
      select (x->>'id')::bigint as product_id,
             greatest(1, coalesce((x->>'quantidade')::integer,1)) as qty
      from jsonb_array_elements(coalesce(old.itens,'[]'::jsonb)) x
      where (x->>'id') ~ '^\d+$'
    loop
      update public.products
      set stock_quantity=stock_quantity+item.qty, updated_at=now()
      where id=item.product_id and stock_quantity is not null;
    end loop;

    -- Reserva o novo estoque. Se faltar, a transação inteira do UPDATE do pedido falha.
    for item in
      select (x->>'id')::bigint as product_id,
             greatest(1, coalesce((x->>'quantidade')::integer,1)) as qty
      from jsonb_array_elements(coalesce(new.itens,'[]'::jsonb)) x
      where (x->>'id') ~ '^\d+$'
    loop
      q := item.qty;
      select stock_quantity into current_stock
      from public.products
      where id=item.product_id
      for update;

      if current_stock is not null then
        if current_stock < q then
          raise exception 'Produto sem estoque suficiente (produto %). Disponível: %, solicitado: %',
            item.product_id, current_stock, q using errcode='P0001';
        end if;
        update public.products
        set stock_quantity=stock_quantity-q, updated_at=now()
        where id=item.product_id;
      end if;
    end loop;
    return new;
  end if;

  return new;
end $$;

drop trigger if exists trg_adjust_product_stock on public.orders;
create trigger trg_adjust_product_stock
before insert or update of itens or delete on public.orders
for each row execute function public.adjust_product_stock_from_order();

-- Mantém RLS ligado nas tabelas envolvidas.
alter table public.products enable row level security;
alter table public.addons enable row level security;
alter table public.required_addons enable row level security;
