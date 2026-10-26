import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@workspace/db/schema";

const { Pool } = pg;
const connectionString = process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "NEON_DATABASE_URL must be configured before Gather's API server can start.",
  );
}

export const neonPool = new Pool({ connectionString });
export const neonDb = drizzle(neonPool, { schema });
