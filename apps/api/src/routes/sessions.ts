import {
  abandonSessionRunRoute,
  completeSessionRunRoute,
  createSessionActivityRoute,
  createSessionCheckinRoute,
  createSessionRunRoute,
  getSessionRunDetailRoute,
  homeQueueRoute,
  listSessionActivitiesRoute,
  listSessionCheckinsRoute,
  listSessionRunsRoute,
  updatePlanSessionRoute,
  updateSessionRunProgressRoute,
} from "@repo/openapi";

import { handleResult, jsonResult } from "../lib/result-handler";
import { createRequireAuthMiddleware } from "../middleware/auth";

import type { AppDeps } from "../app-deps";
import type { OpenAPIHono } from "@hono/zod-openapi";

export function registerSessionRoutes(app: OpenAPIHono, deps: AppDeps): void {
  const requireAuth = createRequireAuthMiddleware({
    config: deps.config,
    authService: deps.services.auth,
  });

  app.openapi(
    { ...homeQueueRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      return jsonResult(
        c,
        deps.services.session.getHomeQueue(auth.user.id),
        200,
      );
    },
  );

  app.openapi(
    { ...createSessionRunRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { sessionId } = c.req.valid("param");
      const headers = c.req.valid("header");
      const idempotencyKey = headers["Idempotency-Key"];
      return handleResult(
        deps.services.session.createOrRecoverRun(
          auth.user.id,
          sessionId,
          idempotencyKey,
        ),
        (created) => c.json({ data: created.data }, created.statusCode),
      );
    },
  );

  app.openapi(
    { ...updatePlanSessionRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { sessionId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(
        c,
        deps.services.session.updatePlanSession(auth.user.id, sessionId, body),
        200,
      );
    },
  );

  app.openapi(
    { ...getSessionRunDetailRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      return jsonResult(
        c,
        deps.services.session.getRunDetail(auth.user.id, runId),
        200,
      );
    },
  );

  app.openapi(
    { ...listSessionRunsRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const query = c.req.valid("query");

      const params = {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        status: query.status,
      };
      return jsonResult(
        c,
        deps.services.session.listSessionRuns(auth.user.id, params),
        200,
      );
    },
  );

  app.openapi(
    { ...listSessionCheckinsRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      return jsonResult(
        c,
        deps.services.session.listRunCheckins(auth.user.id, runId),
        200,
      );
    },
  );

  app.openapi(
    { ...createSessionCheckinRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(
        c,
        deps.services.session.createRunCheckin(auth.user.id, runId, body),
        201,
      );
    },
  );

  app.openapi(
    { ...listSessionActivitiesRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      return jsonResult(
        c,
        deps.services.session.listRunActivities(auth.user.id, runId),
        200,
      );
    },
  );

  app.openapi(
    { ...createSessionActivityRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(
        c,
        deps.services.session.createRunActivity(auth.user.id, runId, body),
        201,
      );
    },
  );

  app.openapi(
    { ...updateSessionRunProgressRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(
        c,
        deps.services.session.saveProgress(auth.user.id, runId, body),
        200,
      );
    },
  );

  app.openapi(
    { ...completeSessionRunRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      return jsonResult(
        c,
        deps.services.session.completeRun(auth.user.id, runId),
        200,
      );
    },
  );

  app.openapi(
    { ...abandonSessionRunRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(
        c,
        deps.services.session.abandonRun(auth.user.id, runId, body.reason),
        200,
      );
    },
  );
}
