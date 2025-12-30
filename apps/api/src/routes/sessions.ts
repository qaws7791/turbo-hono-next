import {
  abandonSessionRunRoute,
  completeSessionRunRoute,
  createSessionRunRoute,
  homeQueueRoute,
  updateSessionRunProgressRoute,
} from "@repo/api-spec";

import { handleResult, jsonResult } from "../lib/result-handler";
import { requireAuth } from "../middleware/auth";
import {
  abandonRun,
  completeRun,
  createOrRecoverRun,
  getHomeQueue,
  saveProgress,
} from "../modules/session";

import type { OpenAPIHono } from "@hono/zod-openapi";

export function registerSessionRoutes(app: OpenAPIHono): void {
  app.openapi(
    { ...homeQueueRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      return jsonResult(c, getHomeQueue(auth.user.id), 200);
    },
  );

  app.openapi(
    { ...createSessionRunRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { sessionId } = c.req.valid("param");
      return handleResult(
        createOrRecoverRun(auth.user.id, sessionId),
        (created) => c.json({ data: created.data }, created.statusCode),
      );
    },
  );

  app.openapi(
    { ...updateSessionRunProgressRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(c, saveProgress(auth.user.id, runId, body), 200);
    },
  );

  app.openapi(
    { ...completeSessionRunRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      return jsonResult(c, completeRun(auth.user.id, runId), 200);
    },
  );

  app.openapi(
    { ...abandonSessionRunRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(c, abandonRun(auth.user.id, runId, body.reason), 200);
    },
  );
}
