/**
 * Cliente Drizzle sobre Neon (Postgres serverless).
 *
 * Usa el driver `neon-serverless` con `Pool` (WebSocket) — NO `neon-http` —
 * porque el adaptador Drizzle de better-auth usa transacciones, que el driver
 * HTTP no soporta. En Node <= 21 se inyecta `ws` como WebSocket; en Node 22+
 * existe `WebSocket` global y la inyección es inofensiva.
 */
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle({ client: pool, schema });
