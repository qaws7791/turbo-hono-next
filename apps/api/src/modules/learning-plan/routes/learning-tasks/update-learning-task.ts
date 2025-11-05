import { OpenAPIHono } from "@hono/zod-openapi";
import { updateLearningTaskRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/update-learning-task";
import status from "http-status";

import { authMiddleware } from "../../../../middleware/auth";
import { learningTaskCommandService } from "../../services/learning-task.command.service";

import type { AuthContext } from "../../../../middleware/auth";

const updateLearningTask = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...updateLearningTaskRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const result = await learningTaskCommandService.updateTask({
      userId: auth.user.id,
      learningTaskId: id,
      ...body,
    });

    return c.json(result, status.OK);
  },
);

export default updateLearningTask;
