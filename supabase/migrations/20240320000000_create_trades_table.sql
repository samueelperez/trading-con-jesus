create table public.trades (
  id uuid default gen_random_uuid() primary key,
  symbol text not null,
  position text not null check (position in ('LONG', 'SHORT')),
  status text not null check (status in ('WIN', 'LOSS', 'PENDING')),
  profit_loss decimal not null,
  commission_paid boolean default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security)
alter table public.trades enable row level security;

-- Crear política para permitir todas las operaciones (puedes ajustar esto según tus necesidades de seguridad)
create policy "Enable all operations for all users" on public.trades
  for all
  using (true)
  with check (true); 