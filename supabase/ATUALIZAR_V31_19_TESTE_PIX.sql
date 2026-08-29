-- Beach Burguer V31.19 — teste completo do Pix e fallback para Pix manual

alter table public.store_state add column if not exists pix_operational boolean not null default true;
alter table public.store_state add column if not exists pix_test_payment_id text;
alter table public.store_state add column if not exists pix_test_status text not null default 'not_tested';
alter table public.store_state add column if not exists pix_test_status_detail text;
alter table public.store_state add column if not exists pix_test_started_at timestamptz;
alter table public.store_state add column if not exists pix_last_test_at timestamptz;
alter table public.store_state add column if not exists pix_last_approved_at timestamptz;

insert into public.store_state(id,pix_operational,pix_test_status,updated_at)
values(1,true,'not_tested',now())
on conflict(id) do update set
  pix_operational=coalesce(public.store_state.pix_operational,true),
  pix_test_status=coalesce(public.store_state.pix_test_status,'not_tested'),
  updated_at=now();
