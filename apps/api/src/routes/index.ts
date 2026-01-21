import { registerAuthRoutes } from "./auth";
import { registerMaterialRoutes } from "./materials";
import { registerPlanRoutes } from "./plans";
import { registerSessionRoutes } from "./sessions";

import type { AppDeps } from "../app-deps";
import type { OpenAPIHono } from "@hono/zod-openapi";

export function registerRoutes(app: OpenAPIHono, deps: AppDeps): void {
  app.get("/health", (c) => c.json({ ok: true }));

  registerAuthRoutes(app, deps);
  registerMaterialRoutes(app, deps);
  registerPlanRoutes(app, deps);
  registerSessionRoutes(app, deps);
}
