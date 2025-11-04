import { OpenAPIHono } from "@hono/zod-openapi";
import { moveLearningTaskRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/move-learning-task";
import status from "http-status";

import { authMiddleware } from "../../../../middleware/auth";
import { learningTaskCommandService } from "../../services/learning-task.command.service";

import type { AuthContext } from "../../../../middleware/auth";

const moveLearningTask = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...moveLearningTaskRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const { learningPlanId, learningTaskId } = c.req.valid("param");
    const { newLearningModuleId, newOrder } = c.req.valid("json");

    const result = await learningTaskCommandService.moveTask({
      userId: auth.user.id,
      learningPlanId,
      learningTaskId,
      newLearningModuleId,
      newOrder,
    });

    return c.json(result, status.OK);
  },
);

export default moveLearningTask;
