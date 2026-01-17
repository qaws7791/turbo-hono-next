import { createMiddleware } from "hono/factory";

import type { RequestIdVariables } from "./request-id";
import type { Logger } from "pino";

type AuthLogContext = {
  readonly user: {
    readonly id: string;
  };
};

type LoggerVariables = RequestIdVariables & {
  readonly auth?: AuthLogContext;
};

export function createLoggerMiddleware(logger: Logger) {
  return createMiddleware<{ Variables: LoggerVariables }>(async (c, next) => {
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
      const userId = c.get("auth")?.user.id;
      logger.info(
        { requestId, method, path, status, durationMs, userId },
        "request.end",
      );
    }
  });
}
