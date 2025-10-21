import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import ws from "ws";

import * as schema from "./schema";

neonConfig.poolQueryViaFetch = true;
neonConfig.webSocketConstructor = ws;

export type CreateDbOptions = {
  readonly databaseUrl: string;
};

export const createDb = (options: CreateDbOptions) => {
  const sql = neon(options.databaseUrl);
  return drizzle({ client: sql, schema });
};

export type Database = ReturnType<typeof createDb>;

export { schema };
