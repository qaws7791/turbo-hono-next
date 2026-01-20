import { createDb } from "@repo/database";

import { ApiError } from "../middleware/error-handler";

import { CONFIG } from "./config";

import type { Database } from "@repo/database";
import type { Config } from "./config";

const dbRef: { current: Database | null } = { current: null };

export function createDatabase(config: Config): Database {
  if (!config.DATABASE_URL) {
    throw new ApiError(500, "CONFIG_ERROR", "DATABASE_URL is required");
  }
  return createDb({ databaseUrl: config.DATABASE_URL });
}

export function getDb(): Database {
  if (dbRef.current) return dbRef.current;
  dbRef.current = createDatabase(CONFIG);
  return dbRef.current;
}
