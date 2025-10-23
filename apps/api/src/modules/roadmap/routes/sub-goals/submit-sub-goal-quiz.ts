import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { submitSubGoalQuizRoute } from "@repo/api-spec/modules/roadmap/routes/sub-goals/submit-sub-goal-quiz";

import { authMiddleware } from "../../../../middleware/auth";
import { AIError } from "../../../ai/errors";
import {
  serializeQuizRecord,
  submitSubGoalQuiz,
} from "../../../ai/services/subgoal-quiz-service";

import type { AuthContext } from "../../../../middleware/auth";

const submitSubGoalQuizHandler = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...submitSubGoalQuizRoute,
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

      const { roadmapId, subGoalId, quizId } = c.req.valid("param");
      const body = c.req.valid("json");

      const numericQuizId = Number(quizId);
      if (!Number.isInteger(numericQuizId)) {
        throw new AIError(
          400,
          "ai:invalid_request",
          "유효한 퀴즈 ID가 필요합니다.",
        );
      }

      const { quiz, evaluation } = await submitSubGoalQuiz({
        userId: auth.user.id,
        roadmapPublicId: roadmapId,
        subGoalPublicId: subGoalId,
        quizId: numericQuizId,
        answers: body.answers,
      });

      const serializedQuiz = serializeQuizRecord(quiz, evaluation);
      const serializedEvaluation = serializedQuiz.latestResult;

      if (!serializedEvaluation) {
        throw new AIError(
          500,
          "ai:quiz_result_store_failed",
          "퀴즈 채점 결과를 불러오지 못했습니다.",
        );
      }

      return c.json(
        {
          quiz: serializedQuiz,
          evaluation: serializedEvaluation,
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }

      console.error("Submit sub-goal quiz error:", error);

      return c.json(
        {
          error: {
            code: "roadmap:internal_error",
            message: "퀴즈 제출 처리 중 오류가 발생했습니다.",
          },
        },
        status.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default submitSubGoalQuizHandler;
