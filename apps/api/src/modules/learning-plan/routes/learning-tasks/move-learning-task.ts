import { OpenAPIHono } from "@hono/zod-openapi";
import { moveLearningTaskRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/move-learning-task";
import status from "http-status";

import { extractAuthContext } from "../../../../lib/auth-context.helper";
import { authMiddleware } from "../../../../middleware/auth";
import { learningTaskCommandService } from "../../services/learning-task.command.service";

const moveLearningTask = new OpenAPIHono().openapi(
  {
    ...moveLearningTaskRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const { id } = c.req.valid("param");
    const { newLearningModuleId, newOrder } = c.req.valid("json");

    const result = await learningTaskCommandService.moveTask({
      userId,
      learningTaskId: id,
      newLearningModuleId,
      newOrder,
    });

    return c.json(result, status.OK);
  },
);

export default moveLearningTask;
