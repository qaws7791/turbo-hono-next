import {
  activatePlanRoute,
  createPlanRoute,
  deletePlanRoute,
  getPlanDetailRoute,
  listPlansRoute,
  updatePlanStatusRoute,
} from "@repo/api-spec";

import { jsonResult } from "../lib/result-handler";
import { requireAuth } from "../middleware/auth";
import {
  activatePlan,
  createPlan,
  deletePlan,
  getPlanDetail,
  listPlans,
  updatePlanStatus,
} from "../modules/plan";

import type { OpenAPIHono } from "@hono/zod-openapi";

export function registerPlanRoutes(app: OpenAPIHono): void {
  app.openapi(
    { ...listPlansRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { spaceId } = c.req.valid("param");
      const query = c.req.valid("query");

      return jsonResult(
        c,
        listPlans(auth.user.id, {
          spaceId,
          page: query.page ?? 1,
          limit: query.limit ?? 20,
          status: query.status,
        }),
        200,
      );
    },
  );

  app.openapi(
    { ...getPlanDetailRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { planId } = c.req.valid("param");
      return jsonResult(c, getPlanDetail(auth.user.id, planId), 200);
    },
  );

  app.openapi(
    { ...createPlanRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { spaceId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(c, createPlan(auth.user.id, spaceId, body), 201);
    },
  );

  app.openapi(
    { ...updatePlanStatusRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { planId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(
        c,
        updatePlanStatus(auth.user.id, planId, body.status),
        200,
      );
    },
  );

  app.openapi(
    { ...activatePlanRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { planId } = c.req.valid("param");
      return jsonResult(c, activatePlan(auth.user.id, planId), 200);
    },
  );

  app.openapi(
    { ...deletePlanRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { planId } = c.req.valid("param");
      return jsonResult(c, deletePlan(auth.user.id, planId), 200);
    },
  );
}
