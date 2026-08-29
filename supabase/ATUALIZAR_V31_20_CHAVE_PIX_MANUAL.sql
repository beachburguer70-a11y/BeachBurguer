-- Beach Burguer V31.20 — chave Pix manual configurável pela Loja

alter table public.store_state
  add column if not exists pix_manual_key text;

update public.store_state
set pix_manual_key = coalesce(nullif(trim(pix_manual_key), ''), '22997849915'),
    updated_at = now()
where id = 1;
