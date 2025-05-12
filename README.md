# Trading Con Jesús

Aplicación web para el registro y seguimiento de operaciones de trading, incluyendo el cálculo automático de comisiones.

## Características

- Registro de operaciones de trading
- Seguimiento de ganancias y pérdidas
- Cálculo automático de comisiones
- Resumen contable en tiempo real
- Soporte para múltiples traders
- Diferentes tipos de operaciones (Swing/Quickie)

## Tecnologías

- Next.js 14
- TypeScript
- TailwindCSS
- Supabase
- React Server Components

## Requisitos

- Node.js 18.17 o superior
- Cuenta en Supabase

## Configuración

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/trading-con-jesus.git
cd trading-con-jesus
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env.local` con las variables de entorno de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## Estructura de la Base de Datos

La aplicación utiliza una tabla `trades` en Supabase con la siguiente estructura:

```sql
CREATE TABLE trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  symbol TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('LONG', 'SHORT')),
  status TEXT NOT NULL CHECK (status IN ('WIN', 'LOSS')),
  profit_loss DECIMAL NOT NULL,
  commission_paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  trader TEXT NOT NULL CHECK (trader IN ('Vivian', 'Stefan', 'Foxian')),
  trade_type TEXT NOT NULL CHECK (trade_type IN ('Swing', 'Quickie')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

## Licencia

MIT
