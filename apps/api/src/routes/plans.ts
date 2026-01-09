import {
  activatePlanRoute,
  createPlanRoute,
  deletePlanRoute,
  getPlanDetailRoute,
  listPlansRoute,
  updatePlanRoute,
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
  updatePlan,
  updatePlanStatus,
} from "../modules/plan";

import type { OpenAPIHono } from "@hono/zod-openapi";

export function registerPlanRoutes(app: OpenAPIHono): void {
  app.openapi(
    { ...listPlansRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const query = c.req.valid("query");

      return jsonResult(
        c,
        listPlans(auth.user.id, {
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
      const body = c.req.valid("json");
      return jsonResult(c, createPlan(auth.user.id, body), 201);
    },
  );

  app.openapi(
    { ...updatePlanRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { planId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(c, updatePlan(auth.user.id, planId, body), 200);
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
