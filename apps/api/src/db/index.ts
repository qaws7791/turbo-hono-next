import { env } from "@/config/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

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
