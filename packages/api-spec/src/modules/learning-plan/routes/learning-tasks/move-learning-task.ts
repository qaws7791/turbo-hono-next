import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanLearningModuleLearningTaskParamsSchema,
  LearningTaskMoveRequestSchema,
  LearningTaskMoveResponseSchema,
} from "../../../learning-plan/schema";

export const moveLearningTaskRoute = createRoute({
  tags: ["LearningPlan Sub-LearningModules"],
  method: "patch",
  path: "/learning-plans/{learningPlanId}/learning-modules/{learningModuleId}/learning-tasks/{learningTaskId}/move",
  summary:
    "Move a learning-task to another learning module or reorder within the same learningModule",
  request: {
    params: LearningPlanLearningModuleLearningTaskParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: LearningTaskMoveRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Learning-task moved successfully",
      content: {
        "application/json": {
          schema: LearningTaskMoveResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - validation failed",
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
