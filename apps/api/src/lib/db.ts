import { createDb } from "@repo/database";

import type { Database } from "@repo/database";

export function createDatabase(databaseUrl: string): Database {
  return createDb({ databaseUrl });
}
