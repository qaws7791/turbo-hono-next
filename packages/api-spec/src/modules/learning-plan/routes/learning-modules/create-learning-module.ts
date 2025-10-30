import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningModuleCreateRequestSchema,
  LearningModuleCreateResponseSchema,
  LearningPlanParamsSchema,
} from "../../../learning-plan/schema";

export const createLearningModuleRoute = createRoute({
  tags: ["Learning Plan Learning modules"],
  method: "post",
  path: "/learning-plans/{learning planId}/learning-modules",
  summary: "Create a new learning module for a learning plan",
  request: {
    params: LearningPlanParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: LearningModuleCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Learning module created successfully",
      content: {
        "application/json": {
          schema: LearningModuleCreateResponseSchema,
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
      description: "Access denied - not learning plan owner",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Learning plan not found",
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
