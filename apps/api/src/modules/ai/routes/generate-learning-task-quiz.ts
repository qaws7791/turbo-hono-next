import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { generateLearningTaskQuizRoute } from "@repo/api-spec/modules/ai/routes";

import { authMiddleware } from "../../../middleware/auth";
import { AIError } from "../errors";
import {
  LEARNING_TASK_QUIZ_STATUS,
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
        throw new AIError(
          401,
          "ai:authentication_required",
          "User authentication required",
        );
      }

      const { learningPlanId, learningTaskId } = c.req.valid("param");
      const query = c.req.valid("query") ?? {};

      const { started, record, latestResult, job } =
        await prepareLearningTaskQuizGeneration({
          userId: auth.user.id,
          learningPlanPublicId: learningPlanId,
          learningTaskPublicId: learningTaskId,
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
          id: "",
          status: LEARNING_TASK_QUIZ_STATUS.failed,
          targetQuestionCount: 4,
          totalQuestions: null,
          requestedAt: null,
          completedAt: null,
          errorMessage:
            "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          questions: null,
          latestResult: null,
        },
        status.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default generateLearningTaskQuiz;
