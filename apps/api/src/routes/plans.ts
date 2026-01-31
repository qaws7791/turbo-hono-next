import {
  activatePlanRoute,
  createPlanRoute,
  deletePlanRoute,
  getPlanDetailRoute,
  listPlansRoute,
  updatePlanRoute,
  updatePlanStatusRoute,
} from "@repo/openapi";

import { jsonResult } from "../lib/result-handler";
import { createRequireAuthMiddleware } from "../middleware/auth";

import type { OpenAPIHono } from "@hono/zod-openapi";
import type { AppDeps } from "../app-deps";

export function registerPlanRoutes(app: OpenAPIHono, deps: AppDeps): void {
  const requireAuth = createRequireAuthMiddleware({
    config: deps.config,
    authService: deps.services.auth,
  });

  app.openapi(
    { ...listPlansRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const query = c.req.valid("query");

      return jsonResult(
        c,
        deps.services.plan.listPlans(auth.user.id, {
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
      return jsonResult(
        c,
        deps.services.plan.getPlanDetail(auth.user.id, planId),
        200,
      );
    },
  );

  app.openapi(
    { ...createPlanRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const body = c.req.valid("json");
      return jsonResult(
        c,
        deps.services.plan.enqueuePlanGeneration(auth.user.id, body),
        202,
      );
    },
  );

  app.openapi(
    { ...updatePlanRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { planId } = c.req.valid("param");
      const body = c.req.valid("json");
      return jsonResult(
        c,
        deps.services.plan.updatePlan(auth.user.id, planId, body),
        200,
      );
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
        deps.services.plan.updatePlanStatus(auth.user.id, planId, body.status),
        200,
      );
    },
  );

  app.openapi(
    { ...activatePlanRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { planId } = c.req.valid("param");
      return jsonResult(
        c,
        deps.services.plan.activatePlan(auth.user.id, planId),
        200,
      );
    },
  );

  app.openapi(
    { ...deletePlanRoute, middleware: [requireAuth] as const },
    async (c) => {
      const auth = c.get("auth");
      const { planId } = c.req.valid("param");
      return jsonResult(
        c,
        deps.services.plan.deletePlan(auth.user.id, planId),
        200,
      );
    },
  );
}
