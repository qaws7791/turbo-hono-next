import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import ws from "ws";
import { CONFIG } from "../config";
import * as schema from "./schema";

neonConfig.poolQueryViaFetch = true;
neonConfig.webSocketConstructor = ws;

const sql = neon(CONFIG.DATABASE_URL);
export const db = drizzle({ client: sql, schema });
