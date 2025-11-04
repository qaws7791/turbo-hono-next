import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { deleteLearningPlanRoute } from "@repo/api-spec/modules/learning-plan/routes/delete";

import { authMiddleware } from "../../../middleware/auth";
import { learningPlanService } from "../services/learning-plan.service";

import type { AuthContext } from "../../../middleware/auth";

const deleteLearningPlan = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...deleteLearningPlanRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const { learningPlanId } = c.req.valid("param");

    const result = await learningPlanService.deleteLearningPlan({
      publicId: learningPlanId,
      userId: auth.user.id,
    });

    return c.json(result, status.OK);
  },
);

export default deleteLearningPlan;
