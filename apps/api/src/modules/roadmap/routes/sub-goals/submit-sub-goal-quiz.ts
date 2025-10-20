import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { authMiddleware, type AuthContext } from "../../../../middleware/auth";
import { AIError } from "../../../ai/errors";
import {
  SubmitSubGoalQuizRequestSchema,
  SubmitSubGoalQuizResponseSchema,
} from "../../../ai/schema";
import {
  serializeQuizRecord,
  submitSubGoalQuiz,
} from "../../../ai/services/subgoal-quiz-service";
import {
  ErrorResponseSchema,
  RoadmapGoalSubGoalQuizParamsSchema,
} from "../../schema";

const submitSubGoalQuizRoute = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  createRoute({
    tags: ["Roadmap Sub-Goals"],
    method: "post",
    path: "/roadmaps/{roadmapId}/sub-goals/{subGoalId}/quizzes/{quizId}/submissions",
    summary: "Submit answers for an AI-generated sub-goal quiz",
    middleware: [authMiddleware] as const,
    request: {
      params: RoadmapGoalSubGoalQuizParamsSchema,
      body: {
        content: {
          "application/json": {
            schema: SubmitSubGoalQuizRequestSchema,
          },
        },
      },
    },
    responses: {
      [status.OK]: {
        content: {
          "application/json": {
            schema: SubmitSubGoalQuizResponseSchema,
          },
        },
        description: "Quiz submitted and evaluated successfully",
      },
      [status.BAD_REQUEST]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Invalid request payload",
      },
      [status.UNAUTHORIZED]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Authentication required",
      },
      [status.FORBIDDEN]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Access denied",
      },
      [status.NOT_FOUND]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Quiz, sub-goal, or roadmap not found",
      },
      [status.CONFLICT]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Quiz is not ready or already submitted",
      },
      [status.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Server error while submitting the quiz",
      },
    },
  }),
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

export default submitSubGoalQuizRoute;
