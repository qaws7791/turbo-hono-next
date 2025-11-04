import { OpenAPIHono } from "@hono/zod-openapi";
import { getLearningTaskRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/get-learning-task";
import status from "http-status";

import { authMiddleware } from "../../../../middleware/auth";
import { learningTaskQueryService } from "../../services/learning-task.query.service";

import type { AuthContext } from "../../../../middleware/auth";

const getLearningTask = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...getLearningTaskRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const { learningPlanId, learningTaskId } = c.req.valid("param");

    const result = await learningTaskQueryService.getTask({
      userId: auth.user.id,
      learningPlanId,
      learningTaskId,
    });

    return c.json(result, status.OK);
  },
);

export default getLearningTask;
