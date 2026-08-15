-- Beach Burguer V31.14 — Base da Bia (WhatsApp + IA)
create table if not exists public.bia_sessions (
  phone text primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.bia_processed_messages (
  message_id text primary key,
  phone text not null,
  created_at timestamptz not null default now()
);

create index if not exists bia_processed_messages_created_at_idx
  on public.bia_processed_messages (created_at desc);

-- As Functions usam SERVICE_ROLE; não é necessário expor essas tabelas ao cliente.
alter table public.bia_sessions enable row level security;
alter table public.bia_processed_messages enable row level security;
