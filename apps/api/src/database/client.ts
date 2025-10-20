import { createDb } from "@repo/database";
import { CONFIG } from "../config";

export const db = createDb({ databaseUrl: CONFIG.DATABASE_URL });
