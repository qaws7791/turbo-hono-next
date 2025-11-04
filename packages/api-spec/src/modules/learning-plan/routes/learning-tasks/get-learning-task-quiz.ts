import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  GenerateLearningTaskQuizParamsSchema,
  GenerateLearningTaskQuizResponseSchema,
} from "../../../ai/schema";

export const getLearningTaskQuizRoute = createRoute({
  tags: ["LearningPlan Sub-LearningModules"],
  method: "get",
  path: "/learning-plans/{learningPlanId}/learning-tasks/{learningTaskId}/quizzes",
  summary: "Get the latest AI-generated quiz for a learning-task",
  description:
    "학습 태스크에 대해 가장 최근에 생성된 AI 퀴즈를 조회합니다. 생성된 퀴즈가 없는 경우 idle 상태를 반환합니다.",
  request: {
    params: GenerateLearningTaskQuizParamsSchema,
  },
  responses: {
    200: {
      description: "Latest AI quiz retrieved successfully",
      content: {
        "application/json": {
          schema: GenerateLearningTaskQuizResponseSchema,
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
      description: "Access denied - not learningPlan owner",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "LearningPlan or learning-task not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
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
