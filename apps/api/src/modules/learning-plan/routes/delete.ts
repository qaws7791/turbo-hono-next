import { OpenAPIHono } from "@hono/zod-openapi";
import { deleteLearningPlanRoute } from "@repo/api-spec/modules/learning-plan/routes/delete";
import status from "http-status";

import { extractAuthContext } from "../../../lib/auth-context.helper";
import { authMiddleware } from "../../../middleware/auth";
import { learningPlanCommandService } from "../services/learning-plan.command.service";

const deleteLearningPlan = new OpenAPIHono().openapi(
  {
    ...deleteLearningPlanRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const { id } = c.req.valid("param");

    const result = await learningPlanCommandService.deleteLearningPlan({
      publicId: id,
      userId,
    });

    return c.json(result, status.OK);
  },
);

export default deleteLearningPlan;
