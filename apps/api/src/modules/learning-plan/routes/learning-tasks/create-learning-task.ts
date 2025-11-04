import { OpenAPIHono } from "@hono/zod-openapi";
import { createLearningTaskRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/create-learning-task";
import status from "http-status";

import { authMiddleware } from "../../../../middleware/auth";
import { learningTaskCommandService } from "../../services/learning-task.command.service";

import type { AuthContext } from "../../../../middleware/auth";

const createLearningTask = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...createLearningTaskRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const { learningPlanId, learningModuleId } = c.req.valid("param");
    const body = c.req.valid("json");

    const result = await learningTaskCommandService.createTask({
      userId: auth.user.id,
      learningPlanId,
      learningModuleId,
      ...body,
    });

    return c.json(result, status.CREATED);
  },
);

export default createLearningTask;
