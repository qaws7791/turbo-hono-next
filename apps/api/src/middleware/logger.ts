import { createMiddleware } from "hono/factory";

import { logger } from "../lib/logger";

import type { RequestIdVariables } from "./request-id";

export const loggerMiddleware = createMiddleware<{
  Variables: RequestIdVariables;
}>(async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const requestId = c.get("requestId");

  logger.info({ requestId, method, path }, "request.start");

  try {
    await next();
  } finally {
    const durationMs = Date.now() - start;
    const status = c.res.status;
    logger.info({ requestId, method, path, status, durationMs }, "request.end");
  }
});
