-- V31.77 - Pedido Premiado aleatório
-- Um único C# sorteado por bloco de 20 pedidos do Cliente.
-- A tabela é acessada somente pelo backend (service_role).

CREATE TABLE IF NOT EXISTS public.prize_draws (
  block_start integer PRIMARY KEY,
  target_number integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prize_draws_block_valid CHECK (block_start >= 1),
  CONSTRAINT prize_draws_target_valid CHECK (
    target_number >= block_start
    AND target_number <= block_start + 19
  )
);

ALTER TABLE public.prize_draws ENABLE ROW LEVEL SECURITY;

-- Não criamos policy para anon/authenticated: o site acessa pelo backend com service_role.
