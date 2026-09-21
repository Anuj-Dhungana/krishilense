import { neon, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleServerless } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ DATABASE_URL is missing in environment variables (.env.local)");
}

// -----------------------------------------------------------------------------
// 1. HTTP Application Client (For Next.js Server Components & Route Handlers)
// Stateless, connectionless HTTP POST queries over port 443.
// -----------------------------------------------------------------------------
const sql = neon(connectionString);
export const db = drizzleHttp(sql, { schema });

// -----------------------------------------------------------------------------
// 2. Pooled TCP Client (For CLI scripts, batch workers, and transactions)
// -----------------------------------------------------------------------------
let workerPoolInstance: Pool | null = null;
let workerDbInstance: ReturnType<typeof drizzleServerless> | null = null;

export function getWorkerDb() {
  if (!connectionString) throw new Error("DATABASE_URL is not set.");

  if (!workerDbInstance) {
    workerPoolInstance = new Pool({
      connectionString,
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