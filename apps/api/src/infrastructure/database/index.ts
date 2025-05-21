import { env } from "@/common/config/env";
import * as schema from "@/infrastructure/database/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export function initializeDatabase() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
  });
  const db = drizzle({
    client: pool,
    schema,
  });
  return db;
}
