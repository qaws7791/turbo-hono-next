import { OpenAPIHono } from "@hono/zod-openapi";
import { generateOpenApiDocument } from "@repo/api-spec/openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import { CONFIG } from "./lib/config";
import { errorHandlerMiddleware } from "./middleware/error-handler";
import { loggerMiddleware } from "./middleware/logger";
import {
  createRateLimitMiddleware,
  getClientIp,
} from "./middleware/rate-limit";
import { requestIdMiddleware } from "./middleware/request-id";
import { registerRoutes } from "./routes";

export function createApp(): OpenAPIHono {
  const app = new OpenAPIHono();

  app.use("*", requestIdMiddleware);
  app.use("*", loggerMiddleware);
  app.use(
    "/api/*",
    createRateLimitMiddleware({
      windowMs: 60 * 1000,
      max: 60,
      keyGenerator: (c) => getClientIp(c) ?? "unknown",
    }),
  );
  app.use(
    "*",
    cors({
      origin: [CONFIG.FRONTEND_URL],
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Idempotency-Key", "X-Request-ID"],
    }),
  );

  app.get("/openapi.json", (c) => c.json(generateOpenApiDocument()));
  app.get("/docs", Scalar({ url: "/openapi.json" }));

  registerRoutes(app);

  app.onError(errorHandlerMiddleware);

  return app;
}
