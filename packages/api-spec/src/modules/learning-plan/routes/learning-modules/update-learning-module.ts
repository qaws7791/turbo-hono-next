import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningModuleUpdateRequestSchema,
  LearningModuleUpdateResponseSchema,
  LearningPlanLearningModuleParamsSchema,
} from "../../../learning-plan/schema";

export const updateLearningModuleRoute = createRoute({
  tags: ["LearningPlan LearningModules"],
  method: "put",
  path: "/learning-plans/{learningPlanId}/learning-modules/{learningModuleId}",
  summary: "Update a learningModule",
  request: {
    params: LearningPlanLearningModuleParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: LearningModuleUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Learning Module updated successfully",
      content: {
        "application/json": {
          schema: LearningModuleUpdateResponseSchema,
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
      description: "Learning Module or learningPlan not found",
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
