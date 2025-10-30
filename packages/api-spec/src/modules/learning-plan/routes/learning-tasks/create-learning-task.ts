import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanLearningModuleParamsSchema,
  LearningTaskCreateRequestSchema,
  LearningTaskCreateResponseSchema,
} from "../../../learning-plan/schema";

export const createLearningTaskRoute = createRoute({
  tags: ["LearningPlan Sub-LearningModules"],
  method: "post",
  path: "/learning-plans/{learningPlanId}/learning-modules/{learningModuleId}/learning-tasks",
  summary: "Create a new learning-task for a learningModule",
  request: {
    params: LearningPlanLearningModuleParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: LearningTaskCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Learning-task created successfully",
      content: {
        "application/json": {
          schema: LearningTaskCreateResponseSchema,
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
      description: "LearningPlan or learning module not found",
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
