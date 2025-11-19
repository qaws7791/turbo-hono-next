import { OpenAPIHono } from "@hono/zod-openapi";
import { deleteLearningTaskRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/delete-learning-task";
import status from "http-status";

import { extractAuthContext } from "../../../../lib/auth-context.helper";
import { authMiddleware } from "../../../../middleware/auth";
import { learningTaskCommandService } from "../../services/learning-task.command.service";

const deleteLearningTask = new OpenAPIHono().openapi(
  {
    ...deleteLearningTaskRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const { id } = c.req.valid("param");

    const result = await learningTaskCommandService.deleteTask({
      userId,
      learningTaskId: id,
    });

    return c.json(result, status.OK);
  },
);

export default deleteLearningTask;
