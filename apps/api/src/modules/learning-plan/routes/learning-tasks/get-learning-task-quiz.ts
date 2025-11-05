import { OpenAPIHono } from "@hono/zod-openapi";
import { getLearningTaskQuizRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/get-learning-task-quiz";
import status from "http-status";

import { authMiddleware } from "../../../../middleware/auth";
import {
  getLatestLearningTaskQuiz,
  serializeQuizRecord,
} from "../../../ai/services/learning-task-quiz-service";

import type { AuthContext } from "../../../../middleware/auth";

const getLearningTaskQuizHandler = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...getLearningTaskQuizRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const auth = c.get("auth");
    const { id } = c.req.valid("param");

    const { record, latestResult } = await getLatestLearningTaskQuiz({
      userId: auth.user.id,
      learningTaskPublicId: id,
    });

    const serialized = serializeQuizRecord(record, latestResult);

    return c.json(serialized, status.OK);
  },
);

export default getLearningTaskQuizHandler;
