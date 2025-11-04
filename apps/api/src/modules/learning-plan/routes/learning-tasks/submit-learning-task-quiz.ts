import { OpenAPIHono } from "@hono/zod-openapi";
import { submitLearningTaskQuizRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/submit-learning-task-quiz";
import status from "http-status";

import { authMiddleware } from "../../../../middleware/auth";
import { AuthErrors } from "../../../auth/errors";
import { BaseError } from "../../../../errors/base.error";
import { ErrorCodes } from "../../../../errors/error-codes";
import { AIErrors } from "../../../ai/errors";
import {
  serializeQuizRecord,
  submitLearningTaskQuiz,
} from "../../../ai/services/learning-task-quiz-service";

import type { AuthContext } from "../../../../middleware/auth";

const submitLearningTaskQuizHandler = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...submitLearningTaskQuizRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      if (!auth?.user?.id) {
        throw AuthErrors.unauthorized();
      }

      const { learningPlanId, learningTaskId, quizId } = c.req.valid("param");
      const body = c.req.valid("json");

      const numericQuizId = Number(quizId);
      if (!Number.isInteger(numericQuizId)) {
        throw new BaseError(
          400,
          ErrorCodes.VALIDATION_INVALID_INPUT,
          "유효한 퀴즈 ID가 필요합니다.",
        );
      }

      const { quiz, evaluation } = await submitLearningTaskQuiz({
        userId: auth.user.id,
        learningPlanPublicId: learningPlanId,
        learningTaskPublicId: learningTaskId,
        quizId: numericQuizId,
        answers: body.answers,
      });

      const serializedQuiz = serializeQuizRecord(quiz, evaluation);
      const serializedEvaluation = serializedQuiz.latestResult;

      if (!serializedEvaluation) {
        throw AIErrors.databaseError({
          message: "퀴즈 채점 결과를 불러오지 못했습니다.",
        });
      }

      return c.json(
        {
          quiz: serializedQuiz,
          evaluation: serializedEvaluation,
        },
        status.OK,
      );
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        throw error;
      }

      console.error("Submit learning-task quiz error:", error);

      return c.json(
        {
          error: {
            code: "AI_001",
            message: "퀴즈 제출 처리 중 오류가 발생했습니다.",
          },
        },
        status.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default submitLearningTaskQuizHandler;
