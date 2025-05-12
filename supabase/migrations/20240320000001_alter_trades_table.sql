-- Eliminar las columnas de precios
ALTER TABLE public.trades
DROP COLUMN IF EXISTS entry_price,
DROP COLUMN IF EXISTS exit_price; 