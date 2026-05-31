import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Página de perfil (server component).
 *
 * Valida la sesión real con `getSession` por `headers()`. El `proxy.ts` ya hace
 * un chequeo optimista de cookie, pero aquí se verifica de verdad; si no hay
 * sesión válida, redirige a `/login`.
 */
export default async function PerfilPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Tu perfil</h1>

      <dl className="flex flex-col gap-4 rounded-lg border border-fd-border p-5">
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-wide text-fd-muted-foreground">
            Nombre
          </dt>
          <dd className="text-sm">{user.name || "—"}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-wide text-fd-muted-foreground">
            Correo electrónico
          </dt>
          <dd className="text-sm">{user.email}</dd>
        </div>
      </dl>
    </main>
  );
}
