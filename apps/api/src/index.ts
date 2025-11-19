import { serve } from "@hono/node-server";

import "dotenv/config";
import app from "./app";
import { log } from "./lib/logger";
import { CONFIG } from "./config";

export type { AppType } from "./app";

serve(
  {
    fetch: app.fetch,
    port: 3999,
  },
  (info) => {
    log.info(`Server is running on http://localhost:${info.port}/ui`, {
      port: info.port,
      environment: CONFIG.NODE_ENV,
    });
  },
);
