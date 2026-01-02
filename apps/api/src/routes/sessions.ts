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
} from "@repo/api-spec";

import { handleResult, jsonResult } from "../lib/result-handler";
import { requireAuth } from "../middleware/auth";
import {
  abandonRun,
  completeRun,
  createOrRecoverRun,
  createRunActivity,
  createRunCheckin,
  getHomeQueue,
  getRunDetail,
  listRunActivities,
  listRunCheckins,
  listSessionRuns,
  saveProgress,
  updatePlanSession,
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
      const headers = c.req.valid("header");
      const idempotencyKey = headers["Idempotency-Key"];
      return handleResult(
        createOrRecoverRun(auth.user.id, sessionId, idempotencyKey),
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
        updatePlanSession(auth.user.id, sessionId, body),
        200,
      );
    },
  );

  app.openapi(
    { ...getSessionRunDetailRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      return jsonResult(c, getRunDetail(auth.user.id, runId), 200);
    },
  );

  app.openapi(
    { ...listSessionRunsRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const query = c.req.valid("query");
      return jsonResult(c, listSessionRuns(auth.user.id, query), 200);
    },
  );

  app.openapi(
    { ...listSessionCheckinsRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      return jsonResult(c, listRunCheckins(auth.user.id, runId), 200);
    },
  );

  app.openapi(
    { ...createSessionCheckinRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(c, createRunCheckin(auth.user.id, runId, body), 201);
    },
  );

  app.openapi(
    { ...listSessionActivitiesRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      return jsonResult(c, listRunActivities(auth.user.id, runId), 200);
    },
  );

  app.openapi(
    { ...createSessionActivityRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { runId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(c, createRunActivity(auth.user.id, runId, body), 201);
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
