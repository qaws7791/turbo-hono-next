import { createDb } from "@repo/database";

import { ApiError } from "../middleware/error-handler";

import { CONFIG } from "./config";

import type { Database } from "@repo/database";

let db: Database | null = null;

export function getDb(): Database {
  if (db) return db;
  if (!CONFIG.DATABASE_URL) {
    throw new ApiError(500, "CONFIG_ERROR", "DATABASE_URL is required");
  }
  db = createDb({ databaseUrl: CONFIG.DATABASE_URL });
  return db;
}
