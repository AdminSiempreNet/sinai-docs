"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/perfil";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    await signIn.email(
      { email, password },
      {
        onSuccess: () => router.push(redirectTo),
        onError: (ctx) => {
          setError("Correo o contraseña incorrectos.");
          console.error(ctx.error);
        },
      },
    );
    setLoading(false);
  }

  function handleSocial(provider: "google" | "facebook") {
    setError(null);
    signIn.social({ provider, callbackURL: redirectTo });
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Inicia sesión</h1>
        <p className="text-sm text-fd-muted-foreground">
          Accede a tu cuenta para continuar.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => handleSocial("google")}
          className="rounded-md border border-fd-border px-4 py-2 text-sm font-medium transition-colors hover:bg-fd-muted"
        >
          Continuar con Google
        </button>
        <button
          type="button"
          onClick={() => handleSocial("facebook")}
          className="rounded-md border border-fd-border px-4 py-2 text-sm font-medium transition-colors hover:bg-fd-muted"
        >
          Continuar con Facebook
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs text-fd-muted-foreground">
        <span className="h-px flex-1 bg-fd-border" />o<span className="h-px flex-1 bg-fd-border" />
      </div>

      <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Correo electrónico
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-fd-border bg-transparent px-3 py-2 text-sm outline-none focus:border-fd-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Contraseña
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-fd-border bg-transparent px-3 py-2 text-sm outline-none focus:border-fd-primary"
          />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="text-center text-sm text-fd-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-fd-primary hover:underline">
          Crea una
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
