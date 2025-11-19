import { OpenAPIHono } from "@hono/zod-openapi";
import { getLearningTaskQuizRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/get-learning-task-quiz";
import status from "http-status";

import { extractAuthContext } from "../../../../lib/auth-context.helper";
import { authMiddleware } from "../../../../middleware/auth";
import {
  getLatestLearningTaskQuiz,
  serializeQuizRecord,
} from "../../../ai/services/learning-task-quiz-service";

const getLearningTaskQuizHandler = new OpenAPIHono().openapi(
  {
    ...getLearningTaskQuizRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    const { userId } = extractAuthContext(c);
    const { id } = c.req.valid("param");

    const { record, latestResult } = await getLatestLearningTaskQuiz({
      userId,
      learningTaskPublicId: id,
    });

    const serialized = serializeQuizRecord(record, latestResult);

    return c.json(serialized, status.OK);
  },
);

export default getLearningTaskQuizHandler;
