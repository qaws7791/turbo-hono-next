import { registerAuthRoutes } from "./auth";
import { registerChatRoutes } from "./chat";
import { registerMaterialRoutes } from "./materials";
import { registerPlanRoutes } from "./plans";
import { registerSessionRoutes } from "./sessions";

import type { OpenAPIHono } from "@hono/zod-openapi";

export function registerRoutes(app: OpenAPIHono): void {
  app.get("/health", (c) => c.json({ ok: true }));

  registerAuthRoutes(app);
  registerMaterialRoutes(app);
  registerPlanRoutes(app);
  registerSessionRoutes(app);
  registerChatRoutes(app);
}
