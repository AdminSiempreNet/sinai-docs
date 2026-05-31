/**
 * Punto único de esquema Drizzle.
 *
 * Combina las tablas de better-auth (auth-schema) con las tablas de dominio.
 * `profile` es una tabla de dominio separada (no `additionalFields` sobre
 * `user`) con relación 1:1 a `user`, para dejar una frontera limpia hacia las
 * futuras tablas de cuestionarios/score.
 */
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

export const profile = pgTable("profile", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
