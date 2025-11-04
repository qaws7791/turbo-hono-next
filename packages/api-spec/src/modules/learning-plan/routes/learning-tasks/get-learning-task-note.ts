import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  GenerateLearningTaskNoteParamsSchema,
  GenerateLearningTaskNoteResponseSchema,
} from "../../../ai/schema";

export const getLearningTaskNoteRoute = createRoute({
  tags: ["LearningPlan Sub-LearningModules"],
  method: "get",
  path: "/learning-plans/{learningPlanId}/learning-tasks/{learningTaskId}/notes",
  summary: "Get AI-generated note for a learning-task",
  description:
    "학습 태스크에 대해 생성된 AI 노트를 조회합니다. 생성된 노트가 없는 경우 idle 상태를 반환합니다.",
  request: {
    params: GenerateLearningTaskNoteParamsSchema,
  },
  responses: {
    200: {
      description: "AI note retrieved successfully",
      content: {
        "application/json": {
          schema: GenerateLearningTaskNoteResponseSchema,
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
