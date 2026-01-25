import openApiDocument from "@repo/api-spec/openapi.json";
import { Scalar } from "@scalar/hono-api-reference";

import { registerAuthRoutes } from "./auth";
import { registerMaterialRoutes } from "./materials";
import { registerPlanRoutes } from "./plans";
import { registerSessionRoutes } from "./sessions";

import type { OpenAPIHono } from "@hono/zod-openapi";
import type { AppDeps } from "../app-deps";

export function registerRoutes(app: OpenAPIHono, deps: AppDeps): void {
  app.get("/health", (c) => {
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: deps.config.SERVICE_NAME,
    });
  });

  app.get("/openapi.json", (c) => {
    return c.json(openApiDocument);
  });
  app.get("/docs", Scalar({ url: "/openapi.json" }));

  registerAuthRoutes(app, deps);
  registerMaterialRoutes(app, deps);
  registerPlanRoutes(app, deps);
  registerSessionRoutes(app, deps);
}
