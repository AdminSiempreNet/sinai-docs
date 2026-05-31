# Tasks — add-auth

> Leyenda: `[x]` hecho y verificado · `[~]` hecho parcialmente · `[ ]` pendiente
> (bloqueado: requiere cuentas/credenciales del usuario o una `DATABASE_URL` real).

## 1. Infraestructura de base de datos

- [ ] 1.1 Crear proyecto/branch en Neon y obtener `DATABASE_URL` — **requiere cuenta Neon**
- [x] 1.2 Instalar dependencias: `better-auth`, `drizzle-orm`, `@neondatabase/serverless`, `ws`; dev: `drizzle-kit`, `@types/ws`
- [x] 1.3 Crear `web/.env` (con `BETTER_AUTH_SECRET` generado) y `web/.env.example`
- [x] 1.4 Crear cliente Drizzle en `web/lib/db/index.ts` con `neon-serverless` + `Pool` y `neonConfig.webSocketConstructor = ws`

## 2. Esquema y migraciones

- [x] 2.1 Configurar `web/drizzle.config.ts` (dialecto `postgresql`, `DATABASE_URL`)
- [x] 2.2 Generar el esquema de better-auth (`user`, `session`, `account`, `verification`) con su CLI → `web/lib/db/auth-schema.ts`
- [x] 2.3 Definir la tabla de dominio `profile` (relación 1:1 con `user.id`) en `web/lib/db/schema.ts`
- [~] 2.4 Generar migraciones (`drizzle-kit generate`) → `web/drizzle/0000_dashing_the_professor.sql` (5 tablas). **Aplicar (`drizzle-kit migrate`) requiere `DATABASE_URL` real**

## 3. Configuración de better-auth

- [x] 3.1 Crear instancia server `web/lib/auth.ts` con `drizzleAdapter(db, { provider: "pg" })`, `emailAndPassword` y `socialProviders` (google, facebook)
- [x] 3.2 Implementar la creación de `profile` al registrarse (hook `databaseHooks.user.create.after`)
- [x] 3.3 Crear el route handler `web/app/api/auth/[...all]/route.ts` con `toNextJsHandler(auth)`
- [x] 3.4 Crear el client `web/lib/auth-client.ts` con `createAuthClient()` exportando `signIn`, `signUp`, `signOut`, `useSession`

## 4. OAuth (proveedores externos)

- [x] 4.1 Configurar credenciales OAuth en Google Cloud (callback `/api/auth/callback/google`) — **requiere Google Cloud Console**
- [x] 4.2 Configurar app y login OAuth en Facebook Developers (callback `/api/auth/callback/facebook`) — **requiere Meta for Developers**

## 5. Interfaz de usuario

- [x] 5.1 Crear segmento `web/app/(auth)/login` con email/contraseña + botones de Google y Facebook
- [x] 5.2 Crear segmento `web/app/(auth)/registro` con email/contraseña + OAuth
- [x] 5.3 Crear `web/app/(app)/perfil` (server component) que lee sesión con `getSession` por `headers()` y muestra los datos
- [x] 5.4 Añadir isla cliente de sesión al navbar (`web/components/auth/user-menu.tsx` vía `layout.shared.tsx`)
- [x] 5.5 Asegurar que todo el copy esté en español neutral (tú, sin voseo)

## 6. Protección de rutas

- [x] 6.1 Crear `web/proxy.ts` (Next 16 renombró `middleware.ts` → `proxy.ts`) con `getSessionCookie` y `matcher: ["/perfil"]`
- [x] 6.2 Validar la sesión real en el server component de `/perfil` y redirigir a `/login` si no es válida

## 7. Verificación

- [x] 7.1 Verificar que `/docs/*` sigue siendo público y estático — `next build` confirma `/docs` y `/docs/[[...slug]]` como `○` (estático) y `/perfil` + `/api/auth` como `ƒ` (dinámico)
- [ ] 7.2 Probar registro, login (email y ambos OAuth), logout y persistencia de sesión — **requiere DB + credenciales OAuth en vivo**
- [ ] 7.3 Verificar que `/perfil` redirige sin sesión y muestra datos con sesión — **requiere entorno en vivo** (lógica validada por build/types)
- [x] 7.4 Ejecutar `openspec validate add-auth --strict`

## Verificación técnica realizada

- `pnpm exec tsc --noEmit` → **sin errores de tipos**.
- `pnpm exec eslint .` → **0 errores**.
- `pnpm exec drizzle-kit generate` → migración SQL generada (`web/drizzle/`).
- `pnpm build` (webpack) → **compila correctamente; 9/9 páginas**; aislamiento SSG confirmado.
- `openspec validate add-auth --strict` → **válido**.

## Hallazgos / decisiones de implementación (no obvios)

1. **Build con webpack, no Turbopack**. `next build` con Turbopack falla en producción al
   recolectar datos de `/api/auth/[...all]`: genera un `require` a un chunk interno de
   better-auth (`better-auth.<hash>.js`) que no existe (bug de tracing de Turbopack con los
   chunks ESM de better-auth). Solución: `build` usa `next build --webpack`. `dev` sigue con
   Turbopack (el bug es exclusivo del trace de build de producción).
2. **Override de `kysely` a 0.28.17** (`pnpm.overrides` en `web/package.json`). better-auth
   1.6.12 carga `@better-auth/kysely-adapter`, que importa `DEFAULT_MIGRATION_LOCK_TABLE` y
   `DEFAULT_MIGRATION_TABLE`, exports que `kysely@0.29.x` ya no expone. Aunque usamos Drizzle
   (no kysely), better-auth lo carga en `context/init`. El pin a 0.28.17 restituye esos exports.
3. **Esquema de auth en snake_case**: el CLI de better-auth genera columnas snake_case
   (`email_verified`, `user_id`, ...) + índices + `relations`. Es la fuente de verdad; regenerar
   con `pnpm auth:generate` si cambian las opciones de auth.
4. **`profile` mínima**: `id`, `userId` (único, FK a `user`), `createdAt`, `updatedAt`. Nombre y
   correo viven en `user` (better-auth). Ancla de dominio para los futuros cuestionarios/scores.
5. **`/login` usa `useSearchParams()` (lee `?redirect=`) y DEBE ir envuelto en `<Suspense>`**.
   Next 16 falla el prerender estático si no (`missing-suspense-with-csr-bailout`). Se extrajo el
   formulario a `<LoginForm>` y la página lo envuelve en `<Suspense>`. Resultado: `/login` queda
   estático (○) sin romper el build.
