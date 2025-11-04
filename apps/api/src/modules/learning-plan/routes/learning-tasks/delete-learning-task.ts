import { OpenAPIHono } from "@hono/zod-openapi";
import { deleteLearningTaskRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/delete-learning-task";
import status from "http-status";

import { authMiddleware } from "../../../../middleware/auth";
import { learningTaskCommandService } from "../../services/learning-task.command.service";

import type { AuthContext } from "../../../../middleware/auth";

const deleteLearningTask = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...deleteLearningTaskRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const { learningPlanId, learningTaskId } = c.req.valid("param");

    const result = await learningTaskCommandService.deleteTask({
      userId: auth.user.id,
      learningPlanId,
      learningTaskId,
    });

    return c.json(result, status.OK);
  },
);

export default deleteLearningTask;
