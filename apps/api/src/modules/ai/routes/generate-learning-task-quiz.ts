import { OpenAPIHono } from "@hono/zod-openapi";
import { generateLearningTaskQuizRoute } from "@repo/api-spec/modules/ai/routes";
import status from "http-status";

import { extractAuthContext } from "../../../lib/auth-context.helper";
import { log } from "../../../lib/logger";
import { authMiddleware } from "../../../middleware/auth";
import { AIError } from "../errors";
import {
  prepareLearningTaskQuizGeneration,
  runLearningTaskQuizGeneration,
  serializeQuizRecord,
} from "../services/learning-task-quiz-service";

const generateLearningTaskQuiz = new OpenAPIHono().openapi(
  {
    ...generateLearningTaskQuizRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const { userId } = extractAuthContext(c);

      const { id } = c.req.valid("param");
      const query = c.req.valid("query") ?? {};

      const { started, record, latestResult, job } =
        await prepareLearningTaskQuizGeneration({
          userId,
          learningTaskPublicId: id,
          force: query.force,
        });

      const payload = serializeQuizRecord(record, latestResult);

      if (started && job) {
        void runLearningTaskQuizGeneration(job);
        return c.json(payload, status.ACCEPTED);
      }

      return c.json(payload, status.OK);
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }

      log.error("AI learning-task quiz generation error", error);

      return c.json(
        {
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message:
              "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          },
        },
        status.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default generateLearningTaskQuiz;
