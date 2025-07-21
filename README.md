# Trading Con Jesús - App Móvil

Aplicación móvil para el registro y seguimiento de operaciones de trading, incluyendo el cálculo automático de comisiones.

## Características

- 📱 **Aplicación móvil nativa** con React Native y Expo
- 💰 **Registro de operaciones** de trading con símbolo, resultado y profit/loss
- 📊 **Resumen contable** automático con totales y comisiones
- 🏦 **Gestión de portfolio** con múltiples exchanges
- ⚡ **Actualizaciones en tiempo real** usando Supabase
- 🎨 **Interfaz moderna** y fácil de usar

## Tecnologías

- **React Native** - Framework para desarrollo móvil
- **Expo** - Plataforma de desarrollo y despliegue
- **TypeScript** - Tipado estático
- **Supabase** - Base de datos y backend
- **React Navigation** - Navegación entre pantallas

## Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd trading-con-jesus-app
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar la aplicación:**
   ```bash
   # Para iOS
   npm run ios
   
   # Para Android
   npm run android
   
   # Para desarrollo web
   npm run web
   ```

## Estructura del Proyecto

```
src/
├── lib/
│   └── supabase.ts          # Configuración de Supabase
├── types/
│   └── trading.ts           # Tipos TypeScript
├── hooks/
│   └── usePortfolio.ts      # Hook para gestión del portfolio
└── screens/
    ├── TradingScreen.tsx    # Pantalla principal de operaciones
    ├── AddTradeScreen.tsx   # Pantalla para añadir operaciones
    └── PortfolioScreen.tsx  # Pantalla de gestión de portfolio
```

## Funcionalidades

### Operaciones de Trading
- Ver lista de todas las operaciones
- Resumen contable automático
- Eliminar operaciones
- Actualizaciones en tiempo real

### Nueva Operación
- Formulario para registrar operaciones
- Validación de datos
- Símbolo, resultado (ganancia/pérdida) y profit/loss

### Portfolio
- Gestión de exchanges
- Balance total del portfolio
- Añadir, editar y eliminar exchanges
- Porcentajes de distribución

## Base de Datos

La aplicación utiliza la misma base de datos Supabase que la versión web:

### Tabla `trades`
- `id` - Identificador único
- `symbol` - Símbolo del activo
- `status` - WIN o LOSS
- `profit_loss` - Cantidad de profit o pérdida
- `commission_paid` - Estado de la comisión
- `created_at` - Fecha de creación

### Tabla `exchanges`
- `id` - Identificador único
- `name` - Nombre del exchange
- `balance` - Balance en USDT
- `created_at` - Fecha de creación

## Comisiones

- **$6.00** por operación ganadora con profit > $20
- Cálculo automático en el resumen contable

## Desarrollo

### Scripts Disponibles

- `npm start` - Iniciar servidor de desarrollo
- `npm run android` - Ejecutar en Android
- `npm run ios` - Ejecutar en iOS
- `npm run web` - Ejecutar en web
- `npm run build` - Construir para producción

### Configuración de Supabase

La aplicación está configurada para usar la misma base de datos que la versión web. Las credenciales están en `lib/supabase.ts`.

## Despliegue

### Expo Go
1. Instalar Expo Go en tu dispositivo móvil
2. Ejecutar `npm start`
3. Escanear el código QR con Expo Go

### Build Nativo
```bash
# Para Android
expo build:android

# Para iOS
expo build:ios
```

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
