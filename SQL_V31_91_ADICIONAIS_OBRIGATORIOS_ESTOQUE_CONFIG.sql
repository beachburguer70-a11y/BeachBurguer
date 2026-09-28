-- V31.91 - Vínculo configurável de adicional obrigatório com produto de estoque
-- + componentes de estoque dos combos.
-- Execute este SQL no Supabase.

alter table public.products
  add column if not exists stock_quantity integer;

alter table public.products
  drop constraint if exists products_stock_quantity_nonnegative;
alter table public.products
  add constraint products_stock_quantity_nonnegative
  check (stock_quantity is null or stock_quantity >= 0);

alter table public.required_addons
  add column if not exists stock_product_id bigint;

alter table public.required_addons
  add column if not exists stock_quantity integer not null default 1;

alter table public.required_addons
  drop constraint if exists required_addons_stock_quantity_positive;
alter table public.required_addons
  add constraint required_addons_stock_quantity_positive
  check (stock_quantity >= 1);

alter table public.products
  add column if not exists stock_component_product_id bigint;

alter table public.products
  add column if not exists stock_component_quantity integer;

alter table public.products
  drop constraint if exists products_stock_component_quantity_positive;
alter table public.products
  add constraint products_stock_component_quantity_positive
  check (stock_component_quantity is null or stock_component_quantity >= 1);

-- Combo Beach Casal: 2 Guaravitas por unidade do combo.
-- A associação usa o produto pelo nome, portanto não depende de ID fixo do banco.
update public.products combo
set stock_component_product_id = bebida.id,
    stock_component_quantity = 2,
    updated_at = now()
from public.products bebida
where lower(trim(combo.name)) = lower('Combo Beach Casal')
  and lower(trim(combo.category)) = lower('Combos')
  and lower(trim(bebida.name)) = lower('Guaravita')
  and lower(trim(bebida.category)) = lower('Bebidas');

-- Mantém a baixa normal + baixa dos componentes configurados.
create or replace function public.adjust_product_stock_from_order()
returns trigger
language plpgsql
as $$
declare
  item record;
  addon record;
  q integer;
  component_q integer;
  current_stock integer;
  addon_name text;
  addon_id bigint;
begin
  if tg_op = 'INSERT' then
    for item in
      select (x->>'id')::bigint as product_id,
             greatest(1, coalesce((x->>'quantidade')::integer,1)) as qty,
             x as raw_item
      from jsonb_array_elements(coalesce(new.itens,'[]'::jsonb)) x
      where (x->>'id') ~ '^\d+$'
    loop
      q := item.qty;

      -- Produto vendido normalmente.
      select stock_quantity into current_stock
      from public.products where id=item.product_id for update;
      if current_stock is not null then
        if current_stock < q then
          raise exception 'Produto sem estoque suficiente (produto %). Disponível: %, solicitado: %', item.product_id, current_stock, q using errcode='P0001';
        end if;
        update public.products set stock_quantity=stock_quantity-q, updated_at=now() where id=item.product_id;
      end if;

      -- Componentes configurados diretamente no produto (ex.: Combo Casal -> 2 Guaravitas).
      select stock_component_product_id, stock_component_quantity
        into addon_id, component_q
      from public.products where id=item.product_id;
      if addon_id is not null and coalesce(component_q,0) > 0 then
        select stock_quantity into current_stock from public.products where id=addon_id for update;
        if current_stock is not null then
          if current_stock < component_q*q then
            raise exception 'Estoque insuficiente para componente do produto % (estoque %, necessário %)', item.product_id, current_stock, component_q*q using errcode='P0001';
          end if;
          update public.products set stock_quantity=stock_quantity-(component_q*q), updated_at=now() where id=addon_id;
        end if;
      end if;

      -- Componentes vinculados aos adicionais obrigatórios escolhidos.
      for addon in
        select
          coalesce(nullif(a->>'id','')::bigint,0) as addon_id,
          a->>'nome' as addon_name,
          coalesce((a->>'preco')::numeric,0) as addon_price
        from jsonb_array_elements(coalesce(item.raw_item->'adicionais','[]'::jsonb)) a
      loop
        if addon.addon_id > 0 then
          select id,name,stock_product_id,stock_quantity,target_product_ids
            into addon
          from public.required_addons
          where id=addon.addon_id and active=true
            and stock_product_id is not null
            and (target_product_ids='[]'::jsonb or target_product_ids @> jsonb_build_array(item.product_id))
          limit 1;
        else
          select id,name,stock_product_id,stock_quantity,target_product_ids
            into addon
          from public.required_addons
          where lower(trim(name))=lower(trim(coalesce(addon.addon_name,'')))
            and active=true
            and stock_product_id is not null
            and (target_product_ids='[]'::jsonb or target_product_ids @> jsonb_build_array(item.product_id))
          order by id
          limit 1;
        end if;

        if addon.stock_product_id is not null then
          component_q := greatest(1,coalesce(addon.stock_quantity,1));
          select stock_quantity into current_stock from public.products where id=addon.stock_product_id for update;
          if current_stock is not null then
            if current_stock < component_q*q then
              raise exception 'Estoque insuficiente para o adicional obrigatório "%". Disponível: %, necessário: %', addon.name, current_stock, component_q*q using errcode='P0001';
            end if;
            update public.products set stock_quantity=stock_quantity-(component_q*q), updated_at=now() where id=addon.stock_product_id;
          end if;
        end if;
      end loop;
    end loop;
    return new;

  elsif tg_op = 'DELETE' then
    for item in
      select (x->>'id')::bigint as product_id,
             greatest(1, coalesce((x->>'quantidade')::integer,1)) as qty,
             x as raw_item
      from jsonb_array_elements(coalesce(old.itens,'[]'::jsonb)) x
      where (x->>'id') ~ '^\d+$'
    loop
      q := item.qty;
      update public.products set stock_quantity=stock_quantity+q, updated_at=now() where id=item.product_id and stock_quantity is not null;

      select stock_component_product_id,stock_component_quantity into addon_id,component_q from public.products where id=item.product_id;
      if addon_id is not null and coalesce(component_q,0)>0 then
        update public.products set stock_quantity=stock_quantity+(component_q*q),updated_at=now() where id=addon_id and stock_quantity is not null;
      end if;

      for addon in
        select coalesce(nullif(a->>'id','')::bigint,0) as addon_id, a->>'nome' as addon_name
        from jsonb_array_elements(coalesce(item.raw_item->'adicionais','[]'::jsonb)) a
      loop
        if addon.addon_id > 0 then
          select id,name,stock_product_id,stock_quantity,target_product_ids into addon
          from public.required_addons where id=addon.addon_id and stock_product_id is not null and (target_product_ids='[]'::jsonb or target_product_ids @> jsonb_build_array(item.product_id)) limit 1;
        else
          select id,name,stock_product_id,stock_quantity,target_product_ids into addon
          from public.required_addons where lower(trim(name))=lower(trim(coalesce(addon.addon_name,''))) and stock_product_id is not null and (target_product_ids='[]'::jsonb or target_product_ids @> jsonb_build_array(item.product_id)) order by id limit 1;
        end if;
        if addon.stock_product_id is not null then
          component_q:=greatest(1,coalesce(addon.stock_quantity,1));
          update public.products set stock_quantity=stock_quantity+(component_q*q),updated_at=now() where id=addon.stock_product_id and stock_quantity is not null;
        end if;
      end loop;
    end loop;
    return old;

  elsif tg_op = 'UPDATE' then
    if new.itens is not distinct from old.itens then return new; end if;

    -- Reverte o pedido antigo usando exatamente as mesmas regras.
    for item in
      select (x->>'id')::bigint as product_id,greatest(1,coalesce((x->>'quantidade')::integer,1)) as qty,x as raw_item
      from jsonb_array_elements(coalesce(old.itens,'[]'::jsonb)) x where (x->>'id') ~ '^\d+$'
    loop
      q:=item.qty;
      update public.products set stock_quantity=stock_quantity+q,updated_at=now() where id=item.product_id and stock_quantity is not null;
      select stock_component_product_id,stock_component_quantity into addon_id,component_q from public.products where id=item.product_id;
      if addon_id is not null and coalesce(component_q,0)>0 then update public.products set stock_quantity=stock_quantity+(component_q*q),updated_at=now() where id=addon_id and stock_quantity is not null; end if;
      for addon in select coalesce(nullif(a->>'id','')::bigint,0) as addon_id,a->>'nome' as addon_name from jsonb_array_elements(coalesce(item.raw_item->'adicionais','[]'::jsonb)) a loop
        if addon.addon_id>0 then
          select id,name,stock_product_id,stock_quantity,target_product_ids into addon from public.required_addons where id=addon.addon_id and stock_product_id is not null and (target_product_ids='[]'::jsonb or target_product_ids @> jsonb_build_array(item.product_id)) limit 1;
        else
          select id,name,stock_product_id,stock_quantity,target_product_ids into addon from public.required_addons where lower(trim(name))=lower(trim(coalesce(addon.addon_name,''))) and stock_product_id is not null and (target_product_ids='[]'::jsonb or target_product_ids @> jsonb_build_array(item.product_id)) order by id limit 1;
        end if;
        if addon.stock_product_id is not null then component_q:=greatest(1,coalesce(addon.stock_quantity,1));update public.products set stock_quantity=stock_quantity+(component_q*q),updated_at=now() where id=addon.stock_product_id and stock_quantity is not null;end if;
      end loop;
    end loop;

    -- Reserva o novo pedido. Qualquer falta faz o UPDATE inteiro falhar.
    for item in
      select (x->>'id')::bigint as product_id,greatest(1,coalesce((x->>'quantidade')::integer,1)) as qty,x as raw_item
      from jsonb_array_elements(coalesce(new.itens,'[]'::jsonb)) x where (x->>'id') ~ '^\d+$'
    loop
      q:=item.qty;
      select stock_quantity into current_stock from public.products where id=item.product_id for update;
      if current_stock is not null then if current_stock<q then raise exception 'Produto sem estoque suficiente (produto %). Disponível: %, solicitado: %',item.product_id,current_stock,q using errcode='P0001';end if;update public.products set stock_quantity=stock_quantity-q,updated_at=now() where id=item.product_id;end if;
      select stock_component_product_id,stock_component_quantity into addon_id,component_q from public.products where id=item.product_id;
      if addon_id is not null and coalesce(component_q,0)>0 then
        select stock_quantity into current_stock from public.products where id=addon_id for update;
        if current_stock is not null then if current_stock<component_q*q then raise exception 'Estoque insuficiente para componente do produto % (estoque %, necessário %)',item.product_id,current_stock,component_q*q using errcode='P0001';end if;update public.products set stock_quantity=stock_quantity-(component_q*q),updated_at=now() where id=addon_id;end if;
      end if;
      for addon in select coalesce(nullif(a->>'id','')::bigint,0) as addon_id,a->>'nome' as addon_name from jsonb_array_elements(coalesce(item.raw_item->'adicionais','[]'::jsonb)) a loop
        if addon.addon_id>0 then select id,name,stock_product_id,stock_quantity,target_product_ids into addon from public.required_addons where id=addon.addon_id and active=true and stock_product_id is not null and (target_product_ids='[]'::jsonb or target_product_ids @> jsonb_build_array(item.product_id)) limit 1;
        else select id,name,stock_product_id,stock_quantity,target_product_ids into addon from public.required_addons where lower(trim(name))=lower(trim(coalesce(addon.addon_name,''))) and active=true and stock_product_id is not null and (target_product_ids='[]'::jsonb or target_product_ids @> jsonb_build_array(item.product_id)) order by id limit 1; end if;
        if addon.stock_product_id is not null then component_q:=greatest(1,coalesce(addon.stock_quantity,1));select stock_quantity into current_stock from public.products where id=addon.stock_product_id for update;if current_stock is not null then if current_stock<component_q*q then raise exception 'Estoque insuficiente para o adicional obrigatório "%". Disponível: %, necessário: %',addon.name,current_stock,component_q*q using errcode='P0001';end if;update public.products set stock_quantity=stock_quantity-(component_q*q),updated_at=now() where id=addon.stock_product_id;end if;end if;
      end loop;
    end loop;
    return new;
  end if;
  return new;
end $$;

drop trigger if exists trg_adjust_product_stock on public.orders;
create trigger trg_adjust_product_stock
before insert or update of itens or delete on public.orders
for each row execute function public.adjust_product_stock_from_order();
