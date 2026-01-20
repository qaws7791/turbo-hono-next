import { OpenAPIHono } from "@hono/zod-openapi";
import { generateOpenApiDocument } from "@repo/api-spec/openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";

import { createErrorHandlerMiddleware } from "./middleware/error-handler";
import { createLoggerMiddleware } from "./middleware/logger";
import {
  createOptionalRateLimitMiddleware,
  getClientIp,
} from "./middleware/rate-limit";
import { requestIdMiddleware } from "./middleware/request-id";
import { secureHeadersMiddleware } from "./middleware/secure-headers";
import { registerRoutes } from "./routes";

import type { AppDeps } from "./app-deps";

export function createApp(deps: AppDeps): OpenAPIHono {
  const app = new OpenAPIHono();

  app.use("*", requestIdMiddleware);
  app.use("*", createLoggerMiddleware(deps.logger));
  app.use("*", secureHeadersMiddleware);

  // Request Size Limits: 256KB
  app.use(
    "*",
    bodyLimit({
      maxSize: 256 * 1024,
      onError: (c) => {
        return c.text("Request Entity Too Large", 413);
      },
    }),
  );

  // CSRF Defense in Depth (API 경로에만 적용)
  app.use(
    "/api/*",
    csrf({
      origin: deps.config.FRONTEND_URL,
    }),
  );
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

  app.get("/openapi.json", (c) => {
    try {
      return c.json(generateOpenApiDocument());
    } catch (error) {
      deps.logger.error(
        {
          error:
            error instanceof Error ? error.message : "Non-Error object caught",
          errorDetail: JSON.stringify(
            error,
            Object.getOwnPropertyNames(error),
            2,
          ),
          stack: error instanceof Error ? error.stack : undefined,
        },
        "Failed to generate OpenAPI document",
      );
      throw error;
    }
  });
  app.get("/docs", Scalar({ url: "/openapi.json" }));

  registerRoutes(app, deps);

  app.onError(createErrorHandlerMiddleware(deps.logger));

  return app;
}
