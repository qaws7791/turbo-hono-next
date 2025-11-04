import { OpenAPIHono } from "@hono/zod-openapi";
import { learningPlanDetailRoute } from "@repo/api-spec/modules/learning-plan/routes/detail";
import status from "http-status";

import { authMiddleware } from "../../../middleware/auth";
import { learningPlanService } from "../services/learning-plan.service";

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
    const { learningPlanId } = c.req.valid("param");

    const response = await learningPlanService.getLearningPlan({
      publicId: learningPlanId,
      userId: auth.user.id,
    });

    return c.json(response, status.OK);
  },
);

export default detail;
