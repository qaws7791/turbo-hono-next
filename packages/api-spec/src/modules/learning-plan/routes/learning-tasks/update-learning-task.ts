import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanLearningModuleLearningTaskParamsSchema,
  LearningTaskUpdateRequestSchema,
  LearningTaskUpdateResponseSchema,
} from "../../../learning-plan/schema";

export const updateLearningTaskRoute = createRoute({
  tags: ["LearningPlan Sub-LearningModules"],
  method: "put",
  path: "/learning-plans/{learningPlanId}/learning-tasks/{learningTaskId}",
  summary: "Update a learning-task",
  request: {
    params: LearningPlanLearningModuleLearningTaskParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: LearningTaskUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Learning-task updated successfully",
      content: {
        "application/json": {
          schema: LearningTaskUpdateResponseSchema,
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
