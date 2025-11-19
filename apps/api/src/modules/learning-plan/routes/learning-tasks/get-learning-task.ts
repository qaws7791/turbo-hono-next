import { OpenAPIHono } from "@hono/zod-openapi";
import { getLearningTaskRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/get-learning-task";
import status from "http-status";

import { extractAuthContext } from "../../../../lib/auth-context.helper";
import { authMiddleware } from "../../../../middleware/auth";
import { learningTaskQueryService } from "../../services/learning-task.query.service";

const getLearningTask = new OpenAPIHono().openapi(
  {
    ...getLearningTaskRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const { id } = c.req.valid("param");

    const result = await learningTaskQueryService.getTask({
      userId,
      learningTaskId: id,
    });

    return c.json(result, status.OK);
  },
);

export default getLearningTask;
