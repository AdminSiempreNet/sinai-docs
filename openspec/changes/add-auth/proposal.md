## Why

El producto busca que usuarios autenticados respondan cuestionarios sobre la documentación
publicada y obtengan un score por cada uno. Esta primera iteración entrega únicamente la base
de identidad —registro, inicio de sesión, sesión y perfil— sin cuestionarios, dejando una
frontera de dominio limpia para incorporarlos después.

## What Changes

- Integrar **better-auth** con email + contraseña y OAuth de **Google** y **Facebook**.
- Integrar **Drizzle ORM** sobre **Neon** (Postgres serverless) con el driver
  `drizzle-orm/neon-serverless` y `Pool` (WebSocket), por el uso de transacciones de better-auth.
- Esquema de datos: tablas administradas por better-auth (`user`, `session`, `account`,
  `verification`) + tabla de dominio **`profile`** separada, que referencia `user.id`.
- Montar el route handler de auth en `app/api/auth/[...all]/route.ts`.
- Añadir páginas `/login`, `/registro` y `/perfil` en un segmento dinámico propio.
- Proteger `/perfil` con middleware mediante chequeo optimista de cookie (sin DB en el edge).
- Mostrar el estado de sesión en el navbar mediante una **isla cliente** (`useSession`), sin
  volver dinámico el sitio de documentación (que permanece público y estático).
- Configurar variables de entorno y el flujo de migraciones con `drizzle-kit`.

## Impact

- Affected specs: `auth` (nuevo), `profile` (nuevo)
- Affected code:
  - `web/lib/auth.ts`, `web/lib/auth-client.ts`, `web/lib/db/` (cliente y esquema Drizzle)
  - `web/app/api/auth/[...all]/route.ts`
  - `web/app/(auth)/login`, `web/app/(auth)/registro`, `web/app/(app)/perfil`
  - `web/proxy.ts`
  - `web/lib/layout.shared.tsx` + componente de navbar (isla cliente de sesión)
  - `web/drizzle.config.ts`, `web/drizzle/` (migraciones)
  - `web/package.json` (dependencias), `web/.env` / `web/.env.example`
