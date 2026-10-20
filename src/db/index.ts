import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool, type PoolConfig } from "pg";

// Strip stray spaces / wrapping quotes that sneak in when pasting env vars.
const databaseUrl = (process.env.DATABASE_URL ?? "").trim().replace(/^(["'])([\s\S]*)\1$/, "$2");

function buildConfig(url: string): PoolConfig {
  const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  if (isLocal) return { connectionString: url };
  // Supabase / hosted Postgres: use SSL, keep pool small for serverless (Vercel).
  const cleaned = url.replace(/([?&])sslmode=[^&]*&?/, "$1").replace(/[?&]$/, "");
  return {
    connectionString: cleaned,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10_000,
  };
}

const globalForDb = globalThis as typeof globalThis & {
  __qaPool?: Pool;
  __qaSchemaReady?: Promise<void>;
};

export const pool = globalForDb.__qaPool ?? new Pool(buildConfig(databaseUrl || "postgresql://unset:unset@127.0.0.1:5432/unset"));
globalForDb.__qaPool = pool;

export const db = drizzle(pool);

/**
 * Creates the tables automatically the first time the app talks to the DB,
 * so a brand-new Supabase project works without running any migration.
 */
export function ensureSchema(): Promise<void> {
  if (!databaseUrl) return Promise.reject(new Error("DATABASE_URL is not set"));
  if (!globalForDb.__qaSchemaReady) {
    globalForDb.__qaSchemaReady = (async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS qa_questions (
          id serial PRIMARY KEY,
          text text NOT NULL,
          status text NOT NULL DEFAULT 'new',
          created_at timestamptz NOT NULL DEFAULT now()
        )`);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS qa_display_state (
          id integer PRIMARY KEY,
          mode text NOT NULL DEFAULT 'welcome',
          text text,
          asked_count integer NOT NULL DEFAULT 0,
          accepting boolean NOT NULL DEFAULT true,
          updated_at timestamptz NOT NULL DEFAULT now()
        )`);
      await db.execute(sql`INSERT INTO qa_display_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);
    })().catch((err) => {
      globalForDb.__qaSchemaReady = undefined;
      throw err;
    });
  }
  return globalForDb.__qaSchemaReady;
}
