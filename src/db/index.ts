import { neon, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleServerless } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// 1. For HTTP queries (neon()), strictly use UNPOOLED direct endpoint
// If DATABASE_URL has "-pooler", strip it so it connects over HTTPS (port 443) without hanging!
const rawUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!rawUrl) {
  throw new Error("❌ DATABASE_URL is missing in environment variables (.env.local)");
}

// Ensure the HTTP driver never hits the PgBouncer pooler port
const httpUrl = rawUrl.replace("-pooler", "");

// -----------------------------------------------------------------------------
// 1. HTTP Application Client (For Next.js Server Components & Route Handlers)
// Stateless, lightning-fast HTTPS queries over Port 443 to Neon direct compute.
// -----------------------------------------------------------------------------
const sql = neon(httpUrl);
export const db = drizzleHttp(sql, { schema });

// -----------------------------------------------------------------------------
// 2. Pooled TCP Client (For CLI scripts, batch workers, and transactions)
// Uses Neon PgBouncer pooler over TCP Port 5432.
// -----------------------------------------------------------------------------
let workerPoolInstance: Pool | null = null;
let workerDbInstance: ReturnType<typeof drizzleServerless> | null = null;

export function getWorkerDb() {
  const poolUrl = process.env.DATABASE_URL || rawUrl;
  if (!workerDbInstance) {
    workerPoolInstance = new Pool({
      connectionString: poolUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    workerDbInstance = drizzleServerless(workerPoolInstance, { schema });
  }

  return workerDbInstance;
}

export async function closeWorkerDb(): Promise<void> {
  if (workerPoolInstance) {
    await workerPoolInstance.end();
    workerPoolInstance = null;
    workerDbInstance = null;
  }
}