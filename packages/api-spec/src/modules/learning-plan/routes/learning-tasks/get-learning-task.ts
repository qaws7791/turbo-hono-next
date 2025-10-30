import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanLearningModuleLearningTaskParamsSchema,
  LearningTaskDetailResponseSchema,
} from "../../../learning-plan/schema";

export const getLearningTaskRoute = createRoute({
  tags: ["LearningPlan Sub-LearningModules"],
  method: "get",
  path: "/learning-plans/{learningPlanId}/learning-tasks/{learningTaskId}",
  summary: "Get detailed information about a learning-task",
  request: {
    params: LearningPlanLearningModuleLearningTaskParamsSchema,
  },
  responses: {
    200: {
      description: "Learning-task detail retrieved successfully",
      content: {
        "application/json": {
          schema: LearningTaskDetailResponseSchema,
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
      description: "LearningPlan, learningModule, or learning-task not found",
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
