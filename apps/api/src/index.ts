import { serve } from "@hono/node-server";

import "dotenv/config";
import { CONFIG } from "./lib/config";
import { logger } from "./lib/logger";
import { createApp } from "./app";

const app = createApp();

serve(
  {
    fetch: app.fetch,
    port: CONFIG.PORT,
  },
  (info) => {
    logger.info(
      {
        port: info.port,
        nodeEnv: CONFIG.NODE_ENV,
        serviceName: CONFIG.SERVICE_NAME,
      },
      "API server listening",
    );
  },
);
