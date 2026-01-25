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
import { createSecureHeadersMiddleware } from "./middleware/secure-headers";
import { registerRoutes } from "./routes";

import type { AppDeps } from "./app-deps";

export function createApp(deps: AppDeps): OpenAPIHono {
  const app = new OpenAPIHono();

  const { apiMiddleware, docsMiddleware } = createSecureHeadersMiddleware(
    deps.config,
  );

  app.use("*", requestIdMiddleware);
  app.use("*", createLoggerMiddleware(deps.logger));

  // 보안 헤더 적용: /docs 경로는 완화된 CSP, 그 외는 엄격한 CSP
  app.use("*", async (c, next) => {
    if (c.req.path.startsWith("/docs")) {
      return docsMiddleware(c, next);
    }
    return apiMiddleware(c, next);
  });

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

  // Health check endpoint for Docker and load balancer
  app.get("/health", (c) => {
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: deps.config.SERVICE_NAME,
    });
  });

  registerRoutes(app, deps);

  app.onError(createErrorHandlerMiddleware(deps.logger));

  return app;
}
