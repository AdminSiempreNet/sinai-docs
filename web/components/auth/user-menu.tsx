"use client";

/**
 * Isla cliente de sesión para el navbar.
 *
 * Lee la sesión con `useSession` para no volver dinámico el resto del sitio
 * (los docs siguen siendo estáticos). Muestra accesos a iniciar sesión /
 * registrarse cuando no hay sesión, y un acceso al perfil + cerrar sesión
 * cuando la hay.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return <div className="h-8 w-20 animate-pulse rounded-md bg-fd-muted" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/registro"
          className="rounded-md bg-fd-primary px-3 py-1.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
        >
          Crear cuenta
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/perfil"
        className="text-sm font-medium text-fd-foreground transition-colors hover:text-fd-primary"
      >
        {session.user.name || "Perfil"}
      </Link>
      <button
        type="button"
        onClick={() =>
          signOut({
            fetchOptions: { onSuccess: () => router.push("/") },
          })
        }
        className="text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
