import { OpenAPIHono } from "@hono/zod-openapi";
import { createLearningPlanRoute } from "@repo/api-spec/modules/learning-plan/routes/create";
import status from "http-status";

import { extractAuthContext } from "../../../lib/auth-context.helper";
import { authMiddleware } from "../../../middleware/auth";
import { learningPlanCommandService } from "../services/learning-plan.command.service";

/**
 * Route handler for creating a new learning plan.
 * Delegates business logic to the service layer.
 */
const create = new OpenAPIHono().openapi(
  {
    ...createLearningPlanRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const body = c.req.valid("json");

    // Delegate to command service layer
    const createdLearningPlan =
      await learningPlanCommandService.createLearningPlan({
        userId,
        ...body,
      });

    return c.json(createdLearningPlan, status.CREATED);
  },
);

export default create;
