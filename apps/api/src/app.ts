import { OpenAPIHono } from "@hono/zod-openapi";
import { generateOpenApiDocument } from "@repo/api-spec/openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import { createErrorHandlerMiddleware } from "./middleware/error-handler";
import { createLoggerMiddleware } from "./middleware/logger";
import {
  createOptionalRateLimitMiddleware,
  getClientIp,
} from "./middleware/rate-limit";
import { requestIdMiddleware } from "./middleware/request-id";
import { registerRoutes } from "./routes";

import type { AppDeps } from "./app-deps";

export function createApp(deps: AppDeps): OpenAPIHono {
  const app = new OpenAPIHono();

  app.use("*", requestIdMiddleware);
  app.use("*", createLoggerMiddleware(deps.logger));
  app.use(
    "/api/*",
    createOptionalRateLimitMiddleware(deps.config.RATE_LIMIT_ENABLED, {
      windowMs: 60 * 1000,
      max: 60,
      keyGenerator: (c) => getClientIp(c) ?? "unknown",
    }),
  );
  app.use(
    "*",
    cors({
      origin: [deps.config.FRONTEND_URL],
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Idempotency-Key", "X-Request-ID"],
    }),
  );

  app.get("/openapi.json", (c) => c.json(generateOpenApiDocument()));
  app.get("/docs", Scalar({ url: "/openapi.json" }));

  registerRoutes(app, deps);

  app.onError(createErrorHandlerMiddleware(deps.logger));

  return app;
}
