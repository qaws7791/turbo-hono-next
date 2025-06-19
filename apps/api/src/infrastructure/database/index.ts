import { env } from "@/common/config/env";
import * as schema from "@/infrastructure/database/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from 'drizzle-orm/neon-http';
export function initializeDatabase() {
  const sql = neon(env.DATABASE_URL);
  const db = drizzle({
    client: sql,
    schema,
  });
  return db;
}
