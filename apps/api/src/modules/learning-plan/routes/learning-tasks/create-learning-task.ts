import { OpenAPIHono } from "@hono/zod-openapi";
import { createLearningTaskRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/create-learning-task";
import status from "http-status";

import { extractAuthContext } from "../../../../lib/auth-context.helper";
import { authMiddleware } from "../../../../middleware/auth";
import { learningTaskCommandService } from "../../services/learning-task.command.service";

const createLearningTask = new OpenAPIHono().openapi(
  {
    ...createLearningTaskRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const body = c.req.valid("json");

    const result = await learningTaskCommandService.createTask({
      userId,
      ...body,
    });

    return c.json(result, status.CREATED);
  },
);

export default createLearningTask;
