import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { updateLearningPlanRoute } from "@repo/api-spec/modules/learning-plan/routes/update";

import { authMiddleware } from "../../../middleware/auth";
import { learningPlanCommandService } from "../services/learning-plan.command.service";

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
    const { id } = c.req.valid("param");
    const updateData = c.req.valid("json");

    const updatedPlan = await learningPlanCommandService.updateLearningPlan({
      publicId: id,
      userId: auth.user.id,
      updateData,
    });

    return c.json(updatedPlan, status.OK);
  },
);

export default update;
