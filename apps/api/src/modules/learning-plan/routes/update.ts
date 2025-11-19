import { OpenAPIHono } from "@hono/zod-openapi";
import { updateLearningPlanRoute } from "@repo/api-spec/modules/learning-plan/routes/update";
import status from "http-status";

import { extractAuthContext } from "../../../lib/auth-context.helper";
import { authMiddleware } from "../../../middleware/auth";
import { learningPlanCommandService } from "../services/learning-plan.command.service";

const update = new OpenAPIHono().openapi(
  {
    ...updateLearningPlanRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const { id } = c.req.valid("param");
    const updateData = c.req.valid("json");

    const updatedPlan = await learningPlanCommandService.updateLearningPlan({
      publicId: id,
      userId,
      updateData,
    });

    return c.json(updatedPlan, status.OK);
  },
);

export default update;
