import { OpenAPIHono } from "@hono/zod-openapi";
import { generateLearningTaskQuizRoute } from "@repo/api-spec/modules/ai/routes";
import status from "http-status";

import { authMiddleware } from "../../../middleware/auth";
import { AuthErrors } from "../../auth/errors";
import { AIError } from "../errors";
import {
  prepareLearningTaskQuizGeneration,
  runLearningTaskQuizGeneration,
  serializeQuizRecord,
} from "../services/learning-task-quiz-service";

import type { AuthContext } from "../../../middleware/auth";

const generateLearningTaskQuiz = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...generateLearningTaskQuizRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");

      if (!auth?.user?.id) {
        throw AuthErrors.unauthorized();
      }

      const { id } = c.req.valid("param");
      const query = c.req.valid("query") ?? {};

      const { started, record, latestResult, job } =
        await prepareLearningTaskQuizGeneration({
          userId: auth.user.id,
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

      console.error("AI learning-task quiz generation error:", error);

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
