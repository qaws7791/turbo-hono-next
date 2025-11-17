import { serve } from "@hono/node-server";

import "dotenv/config";
import app from "./app";
import { log } from "./lib/logger";

export type { AppType } from "./app";

serve(
  {
    fetch: app.fetch,
    port: 3999,
  },
  (info) => {
    log.info(`Server is running on http://localhost:${info.port}/ui`, {
      port: info.port,
      environment: process.env.NODE_ENV || "development",
    });
  },
);
