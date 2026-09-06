-- V31.87 - Estoque simples por produto
-- NULL = estoque ilimitado. 0 = esgotado.
alter table public.products
  add column if not exists stock_quantity integer;

alter table public.products
  drop constraint if exists products_stock_quantity_nonnegative;
alter table public.products
  add constraint products_stock_quantity_nonnegative
  check (stock_quantity is null or stock_quantity >= 0);

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
      where (x->>'id') ~ '^\\d+$'
    loop
      q := item.qty;
      select stock_quantity into current_stock
      from public.products where id=item.product_id for update;
      if current_stock is not null then
        if current_stock < q then
          raise exception 'Produto sem estoque suficiente (produto %). Disponível: %, solicitado: %', item.product_id, current_stock, q
            using errcode='P0001';
        end if;
        update public.products set stock_quantity=stock_quantity-q, updated_at=now()
        where id=item.product_id;
      end if;
    end loop;
    return new;
  elsif tg_op = 'DELETE' then
    for item in
      select (x->>'id')::bigint as product_id,
             greatest(1, coalesce((x->>'quantidade')::integer,1)) as qty
      from jsonb_array_elements(coalesce(old.itens,'[]'::jsonb)) x
      where (x->>'id') ~ '^\\d+$'
    loop
      update public.products
      set stock_quantity=stock_quantity+item.qty, updated_at=now()
      where id=item.product_id and stock_quantity is not null;
    end loop;
    return old;
  elsif tg_op = 'UPDATE' then
    if new.itens is not distinct from old.itens then return new; end if;
    -- devolve o estoque antigo e, em seguida, reserva o novo; se faltar estoque,
    -- toda a transação é desfeita pelo erro.
    for item in
      select (x->>'id')::bigint as product_id,
             greatest(1, coalesce((x->>'quantidade')::integer,1)) as qty
      from jsonb_array_elements(coalesce(old.itens,'[]'::jsonb)) x
      where (x->>'id') ~ '^\\d+$'
    loop
      update public.products set stock_quantity=stock_quantity+item.qty, updated_at=now()
      where id=item.product_id and stock_quantity is not null;
    end loop;
    for item in
      select (x->>'id')::bigint as product_id,
             greatest(1, coalesce((x->>'quantidade')::integer,1)) as qty
      from jsonb_array_elements(coalesce(new.itens,'[]'::jsonb)) x
      where (x->>'id') ~ '^\\d+$'
    loop
      q := item.qty;
      select stock_quantity into current_stock from public.products where id=item.product_id for update;
      if current_stock is not null then
        if current_stock < q then
          raise exception 'Produto sem estoque suficiente (produto %). Disponível: %, solicitado: %', item.product_id, current_stock, q
            using errcode='P0001';
        end if;
        update public.products set stock_quantity=stock_quantity-q, updated_at=now()
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

alter table public.products enable row level security;
