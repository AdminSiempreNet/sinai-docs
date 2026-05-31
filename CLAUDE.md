# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`sinai-docs` is a documentation site built with **Fumadocs** on **Next.js 16** (App Router, React 19). The published docs are meant to back quizzes/scoring per user — but that feature is not built yet. The active planned work is **user authentication** (see `openspec/tareas.md`).

The actual application lives in `web/`. The repository root only holds AI tooling config (`.claude`, `.codex`, `.opencode`) and the OpenSpec workflow (`openspec/`). **Run all app commands from `web/`.**

## Commands

The package manager is **pnpm** (pinned via `packageManager` in `web/package.json`). All commands run inside `web/`:

```bash
cd web
pnpm install        # also runs `fumadocs-mdx` via postinstall to generate the .source/ directory
pnpm dev            # dev server at http://localhost:3000 (Turbopack)
pnpm build          # production build — uses `next build --webpack` (see note below)
pnpm start          # serve the production build
pnpm lint           # eslint (flat config: eslint.config.mjs, extends eslint-config-next)
pnpm db:generate    # drizzle-kit generate — emit SQL migration from lib/db/schema.ts
pnpm db:migrate     # drizzle-kit migrate — apply migrations (needs a real DATABASE_URL)
pnpm auth:generate  # regenerate better-auth schema into lib/db/auth-schema.ts
```

There is no test runner configured yet.

### Build must use Webpack, not Turbopack

`pnpm build` is pinned to `next build --webpack`. Turbopack's production build fails while
collecting page data for `/api/auth/[...all]`: it emits a `require` to a better-auth internal
ESM chunk (`better-auth.<hash>.js`) that doesn't exist — a Turbopack tracing bug with
better-auth's chunked ESM output. `pnpm dev` still uses Turbopack (the bug is specific to the
production build trace). Revisit when Turbopack/better-auth resolve the chunk tracing.

### Kysely override

`web/package.json` pins `kysely` to `0.28.17` via `pnpm.overrides`. better-auth 1.6.12 loads
`@better-auth/kysely-adapter`, which imports `DEFAULT_MIGRATION_LOCK_TABLE` /
`DEFAULT_MIGRATION_TABLE` — exports removed from `kysely@0.29.x`. We use Drizzle (not kysely),
but better-auth loads the adapter in `context/init`, so the pin is required for the build to pass.

## Architecture

The content/rendering pipeline is the core of the codebase. Understanding how these pieces connect matters more than any single file:

1. **`web/content/docs/*.mdx`** — the documentation source. Each file is a page; frontmatter supplies `title`/`description`.
2. **`web/source.config.ts`** — `defineDocs({ dir: 'content/docs' })` tells `fumadocs-mdx` where content lives. Editing this regenerates `web/.source/` (a build artifact, gitignored).
3. **`web/lib/source.ts`** — wraps the generated source with `loader()` and sets `baseUrl: '/docs'`. The exported `source` is the single access point for pages and the page tree.
4. **`web/app/docs/[[...slug]]/page.tsx`** — catch-all route. Resolves a page via `source.getPage(slug)`, renders MDX body through `getMDXComponents()`, and statically generates params.
5. **`web/app/docs/layout.tsx`** — wraps doc pages in Fumadocs `DocsLayout`, feeding it `source.pageTree` for the sidebar.
6. **`web/app/api/search/route.ts`** — search endpoint generated from `source` via `createFromSource`.

Shared layout config (nav title, links) lives in **`web/lib/layout.shared.tsx`** (`baseOptions()`), used by both the root and docs layouts. MDX component overrides go in **`web/mdx-components.tsx`**.

The `@/*` path alias maps to `web/*` (see `web/tsconfig.json`).

### Key implication

When adding or changing docs, edit MDX under `content/docs/` — routes are derived automatically, no route files needed. After changing `source.config.ts`, the `.source/` directory must be regenerated (happens on install/build).

## Authentication (iteration 1)

The active change is **`add-auth`** (`openspec/changes/add-auth/`): registration + auth so users get a profile. Quizzes/scoring come later — out of scope here, but the data model must leave a clean boundary for them. Stack: **better-auth**, **Drizzle ORM**, **Neon** (Postgres serverless). None of it exists in the codebase yet.

### Decisions (locked in)

1. **Scope**: register, login, logout, session, and a `/perfil` page. Docs stay **public**; only `/perfil` is gated. No quizzes yet.
2. **Methods**: email + password **and** OAuth with **Google** and **Facebook**. Email verification is **out of scope** for this iteration (avoids adding an email provider); revisit later.
3. **DB driver**: `drizzle-orm/neon-serverless` with **`Pool`** (WebSocket), **not** `neon-http`. Reason: better-auth's Drizzle adapter uses transactions, which the HTTP driver doesn't support. On Node ≤21 set `neonConfig.webSocketConstructor = ws`.
4. **Schema ownership**: better-auth owns `user`, `session`, `account`, `verification` (generated via its CLI). The domain owns a **separate `profile` table** (not `additionalFields` on `user`) referencing `user.id` — kept separate to leave a clean boundary toward future quiz/score tables.
5. **SSG isolation**: the docs are static and must NOT become dynamic.
   - (b) Session state in the navbar is read via a **client island** (`useSession`).
   - (c) `/perfil` and the auth routes live in their **own dynamic segment**.
   - Never read the session in the root `layout.tsx` (it would make the whole site dynamic).

### better-auth + Next.js patterns (confirmed against current docs)

- Server `auth` instance with `drizzleAdapter(db, { provider: "pg" })`, `emailAndPassword`, and `socialProviders` (google, facebook).
- Route handler: `toNextJsHandler(auth.handler)` at `app/api/auth/[...all]/route.ts`.
- Server read: `auth.api.getSession({ headers: await headers() })`.
- Middleware: optimistic `getSessionCookie(request)` (no DB call on the edge), `matcher: ["/perfil"]`; real validation happens in the `/perfil` server component.
- Client (`lib/auth-client.ts`): `createAuthClient()` → `signIn`, `signUp`, `signOut`, `useSession`.

### Required env vars

`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`.

## OpenSpec workflow

This repo uses OpenSpec (spec-driven development) — config in `openspec/config.yaml` (`schema: spec-driven`). Slash commands are available under `/opsx:*` (e.g. `/opsx:new`, `/opsx:propose`, `/opsx:apply`, `/opsx:verify`, `/opsx:archive`). The same skill set is mirrored for Codex and OpenCode under `.codex/` and `.opencode/`. Use these for structured changes; artifacts are tracked under `openspec/`.

## Conventions

- **Commits**: Conventional Commits, scoped where useful (e.g. `feat(web): ...`). No AI attribution / Co-Authored-By lines.
- **User-facing copy** (UI strings, docs visible to end users) must be **neutral Spanish** using "tú" conjugations (Ingresa, Selecciona, Define) — never voseo or other regional forms. The site `lang` is `es`.

- Next16 no usa middleware.ts sino proxy.ts (Tenlo en cuenta para todo lo relacionado con la autenticacón) Consulta la documentación si es necesario
