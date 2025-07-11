import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { DATABASE_CONFIG } from "../config/database.config";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle>;

export function getDatabase() {
  if (!db) {
    const sql = neon(DATABASE_CONFIG.DATABASE_URL);
    db = drizzle(sql, { schema });
  }
  return db;
}

export type Database = ReturnType<typeof getDatabase>;
