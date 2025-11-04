import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { createLearningPlanRoute } from "@repo/api-spec/modules/learning-plan/routes/create";

import { authMiddleware } from "../../../middleware/auth";
import { learningPlanCommandService } from "../services/learning-plan.command.service";

import type { AuthContext } from "../../../middleware/auth";

/**
 * Route handler for creating a new learning plan.
 * Delegates business logic to the service layer.
 */
const create = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...createLearningPlanRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const body = c.req.valid("json");

    // Delegate to command service layer
    const createdLearningPlan =
      await learningPlanCommandService.createLearningPlan({
        userId: auth.user.id,
        ...body,
      });

    return c.json(createdLearningPlan, status.CREATED);
  },
);

export default create;
