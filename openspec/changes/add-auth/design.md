## Context

`web/` es una app **Next.js 16.2.6 (App Router) / React 19.2.4** que sirve documentación con
**fumadocs**. Hoy el sitio es 100% estático (SSG) y no tiene base de datos, autenticación ni
archivos `.env`. La meta de producto a mediano plazo son cuestionarios con score por usuario;
esta iteración solo entrega autenticación + perfil.

La tensión central del diseño: introducir estado por-usuario (dinámico) en un sitio de
documentación estático sin degradar el caché/SSG de los docs.

## Goals / Non-Goals

**Goals**

- Registro, login, logout y sesión con email + contraseña y OAuth (Google, Facebook).
- Página `/perfil` protegida que muestra los datos del usuario autenticado.
- Modelo de datos que deje lugar limpio para cuestionarios/scores futuros.
- Mantener la documentación pública y estática.

**Non-Goals**

- Cuestionarios, scores, ranking (iteraciones siguientes).
- Verificación de email y recuperación de contraseña (fuera de esta iteración).
- Roles/permisos, panel de administración.
- Gatear contenido de documentación.

## Decisions

### 1. Driver de base de datos: `neon-serverless` con `Pool`

Se usa `drizzle-orm/neon-serverless` + `Pool` (WebSocket), **no** `neon-http`. El adaptador
Drizzle de better-auth ejecuta transacciones en algunos flujos (p. ej. linking de cuentas
OAuth), y el driver HTTP no soporta transacciones multi-statement. En Node ≤21 se inyecta
`neonConfig.webSocketConstructor = ws`.

```typescript
// web/lib/db/index.ts (forma)
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

### 2. Propiedad del esquema: better-auth vs dominio

```
better-auth (generadas con su CLI)        dominio (escritas a mano)
┌──────────────────────────────┐          ┌───────────────────────┐
│ user · session · account ·   │          │ profile               │
│ verification                 │◀─────────│  user_id → user.id    │
└──────────────────────────────┘  1:1     └───────────────────────┘
                                                    ▲
                                       (futuro) quiz_attempt, score
```

`profile` se mantiene como **tabla separada** (no `additionalFields` sobre `user`) para aislar
las preocupaciones de auth del dominio y dejar una frontera natural a la que conectar
`quiz_attempt`/`score` más adelante. Relación 1:1 con `user`, creada al registrarse.

### 3. Aislamiento de sesión vs SSG

```
layout.tsx (raíz)  ── NO lee sesión ──▶  permanece estático
   │
   ├─ /docs/*                 estático, público
   ├─ navbar  ── isla cliente (useSession) ──▶ muestra login/usuario sin volver dinámica la página
   │
   └─ segmento dinámico:
        (auth)/login, (auth)/registro   públicos pero dinámicos
        (app)/perfil                    protegido (server: getSession por headers())
```

- **(b)** El navbar usa una isla cliente con `useSession` del client de better-auth; las
  páginas de docs siguen siendo estáticas.
- **(c)** `/perfil` y las rutas de auth viven en un segmento dinámico propio; nunca se lee la
  sesión en el `layout.tsx` raíz (lo volvería todo dinámico).

### 4. Patrones de integración (better-auth + Next.js)

- Instancia server `auth` (`web/lib/auth.ts`) con `drizzleAdapter(db, { provider: "pg" })`,
  `emailAndPassword.enabled` y `socialProviders` (google, facebook).
- Route handler: `toNextJsHandler(auth.handler)` en `app/api/auth/[...all]/route.ts`.
- Lectura server: `auth.api.getSession({ headers: await headers() })`.
- Middleware: `getSessionCookie(request)` (chequeo optimista, sin DB en edge),
  `matcher: ["/perfil"]`; la validación real de sesión ocurre en el server component de
  `/perfil`.
- Cliente (`web/lib/auth-client.ts`): `createAuthClient()` → `signIn`, `signUp`, `signOut`,
  `useSession`.

### 5. Migraciones

`drizzle-kit` con dialecto `postgresql`. El esquema de auth se genera con el CLI de better-auth
y se combina con el esquema de dominio (`profile`) en un único punto de esquema Drizzle; las
migraciones se generan/aplican con `drizzle-kit generate` / `migrate`.

## Risks / Trade-offs

- **Node WebSocket**: si el runtime es Node ≤21, sin `webSocketConstructor = ws` las
  transacciones fallan. Se mitiga inyectando `ws` siempre.
- **OAuth Facebook**: requiere app de Facebook con login configurado; su revisión/permisos
  puede ser más lento que Google. Riesgo de cronograma, no técnico.
- **Flash en el navbar**: la isla cliente puede mostrar un estado de carga breve antes de
  resolver la sesión. Aceptado a cambio de preservar el SSG de los docs.
- **Cookie optimista en middleware**: solo verifica presencia de cookie, no validez. Aceptable
  porque la validación real se hace en el server de `/perfil`.

## Migration Plan

1. Crear proyecto/branch en Neon y obtener `DATABASE_URL`.
2. Configurar variables de entorno (`.env`) y `.env.example`.
3. Instalar dependencias, definir esquema, generar y aplicar migraciones.
4. Configurar OAuth en Google Cloud y Facebook Developers (callbacks).
5. Desplegar con las variables de entorno en el entorno de hosting.

## Open Questions

- ¿Proveedor/host de despliegue definitivo (Vercel u otro) para fijar `BETTER_AUTH_URL` y los
  callbacks de OAuth?
  Resuelto: Vercel para despliegue
- ¿Qué campos mínimos lleva `profile` además de los de `user` (p. ej. `display_name`,
  `avatar_url`), o se deja vacío de momento como ancla de dominio?

