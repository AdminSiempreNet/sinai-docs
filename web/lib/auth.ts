/**
 * Instancia server de better-auth.
 *
 * - Adaptador Drizzle sobre Postgres (provider "pg").
 * - Email + contraseña y OAuth con Google y Facebook.
 * - Hook que crea un `profile` de dominio al registrarse cualquier usuario
 *   (por email/contraseña o por OAuth).
 * - `nextCookies()` debe ir último para que las cookies se fijen en server actions.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { user, session, account, verification, profile } from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          await db.insert(profile).values({ userId: createdUser.id });
        },
      },
    },
  },
  plugins: [nextCookies()],
});
