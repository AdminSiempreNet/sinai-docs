"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";

export default function RegistroPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    await signUp.email(
      { name, email, password },
      {
        onSuccess: () => router.push("/perfil"),
        onError: (ctx) => {
          setError(
            ctx.error.code === "USER_ALREADY_EXISTS"
              ? "Ese correo ya está registrado."
              : "No se pudo crear la cuenta. Inténtalo de nuevo.",
          );
          console.error(ctx.error);
        },
      },
    );
    setLoading(false);
  }

  function handleSocial(provider: "google" | "facebook") {
    setError(null);
    signIn.social({ provider, callbackURL: "/perfil" });
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Crea tu cuenta</h1>
        <p className="text-sm text-fd-muted-foreground">
          Regístrate para acceder a tu perfil.
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

      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-fd-border bg-transparent px-3 py-2 text-sm outline-none focus:border-fd-primary"
          />
        </label>
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
            minLength={8}
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
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-sm text-fd-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-fd-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
