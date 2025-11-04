import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { updateLearningPlanRoute } from "@repo/api-spec/modules/learning-plan/routes/update";

import { authMiddleware } from "../../../middleware/auth";
import { learningPlanService } from "../services/learning-plan.service";

import type { AuthContext } from "../../../middleware/auth";

const update = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...updateLearningPlanRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const { learningPlanId } = c.req.valid("param");
    const updateData = c.req.valid("json");

    const updatedPlan = await learningPlanService.updateLearningPlan({
      publicId: learningPlanId,
      userId: auth.user.id,
      updateData,
    });

    return c.json(updatedPlan, status.OK);
  },
);

export default update;
