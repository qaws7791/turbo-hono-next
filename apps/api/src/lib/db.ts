import { createDb } from "@repo/database";

import { ApiError } from "../middleware/error-handler";

import { CONFIG } from "./config";

import type { Database } from "@repo/database";
import type { Config } from "./config";

let db: Database | null = null;

export function createDatabase(config: Config): Database {
  if (!config.DATABASE_URL) {
    throw new ApiError(500, "CONFIG_ERROR", "DATABASE_URL is required");
  }
  return createDb({ databaseUrl: config.DATABASE_URL });
}

export function getDb(): Database {
  if (db) return db;
  db = createDatabase(CONFIG);
  return db;
}
