import { OpenAPIHono } from "@hono/zod-openapi";
import { learningPlanDetailRoute } from "@repo/api-spec/modules/learning-plan/routes/detail";
import status from "http-status";

import { authMiddleware } from "../../../middleware/auth";
import { learningPlanQueryService } from "../services/learning-plan.query.service";

import type { AuthContext } from "../../../middleware/auth";

const detail = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...learningPlanDetailRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const { id } = c.req.valid("param");

    const response = await learningPlanQueryService.getLearningPlan({
      publicId: id,
      userId: auth.user.id,
    });

    return c.json(response, status.OK);
  },
);

export default detail;
