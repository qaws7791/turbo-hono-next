import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import * as schema from "./schema";

export type CreateDbOptions = {
  readonly databaseUrl: string;
};

export const createDb = (options: CreateDbOptions) => {
  const db = drizzle({
    connection: options.databaseUrl,
    ws: ws,
    schema,
  });
  return db;
};

export type Database = ReturnType<typeof createDb>;

export { schema };
