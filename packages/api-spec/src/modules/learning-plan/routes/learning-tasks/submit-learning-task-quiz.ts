import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanLearningModuleLearningTaskQuizParamsSchema,
} from "../../../learning-plan/schema";
import {
  SubmitLearningTaskQuizRequestSchema,
  SubmitLearningTaskQuizResponseSchema,
} from "../../../ai/schema";

export const submitLearningTaskQuizRoute = createRoute({
  tags: ["LearningPlan Sub-LearningModules"],
  method: "post",
  path: "/learning-plans/{learningPlanId}/learning-tasks/{learningTaskId}/quizzes/{quizId}/submissions",
  summary: "Submit answers for an AI-generated learning-task quiz",
  request: {
    params: LearningPlanLearningModuleLearningTaskQuizParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: SubmitLearningTaskQuizRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Quiz submitted and evaluated successfully",
      content: {
        "application/json": {
          schema: SubmitLearningTaskQuizResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request payload",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Authentication required",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Access denied",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Quiz, learning-task, or learningPlan not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    409: {
      description: "Quiz is not ready or already submitted",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Server error while submitting the quiz",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
});
