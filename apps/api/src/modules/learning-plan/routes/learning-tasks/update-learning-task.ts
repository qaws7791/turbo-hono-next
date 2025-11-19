import { OpenAPIHono } from "@hono/zod-openapi";
import { updateLearningTaskRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/update-learning-task";
import status from "http-status";

import { extractAuthContext } from "../../../../lib/auth-context.helper";
import { authMiddleware } from "../../../../middleware/auth";
import { learningTaskCommandService } from "../../services/learning-task.command.service";

const updateLearningTask = new OpenAPIHono().openapi(
  {
    ...updateLearningTaskRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const result = await learningTaskCommandService.updateTask({
      userId,
      learningTaskId: id,
      ...body,
    });

    return c.json(result, status.OK);
  },
);

export default updateLearningTask;
