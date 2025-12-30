import { registerAuthRoutes } from "./auth";
import { registerChatRoutes } from "./chat";
import { registerConceptRoutes } from "./concepts";
import { registerMaterialRoutes } from "./materials";
import { registerPlanRoutes } from "./plans";
import { registerSessionRoutes } from "./sessions";
import { registerSpaceRoutes } from "./spaces";

import type { OpenAPIHono } from "@hono/zod-openapi";

export function registerRoutes(app: OpenAPIHono): void {
  app.get("/health", (c) => c.json({ ok: true }));

  registerAuthRoutes(app);
  registerSpaceRoutes(app);
  registerMaterialRoutes(app);
  registerPlanRoutes(app);
  registerSessionRoutes(app);
  registerConceptRoutes(app);
  registerChatRoutes(app);
}
