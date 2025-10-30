import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanParamsSchema,
  LearningPlanUpdateRequestSchema,
  LearningPlanUpdateResponseSchema,
} from "../../learning-plan/schema";

export const updateLearningPlanRoute = createRoute({
  tags: ["LearningPlan"],
  method: "patch",
  path: "/learning-plans/{id}",
  summary: "Update a learningPlan",
  request: {
    params: LearningPlanParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: LearningPlanUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "LearningPlan updated successfully",
      content: {
        "application/json": {
          schema: LearningPlanUpdateResponseSchema,
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
      description: "Access denied - not the owner",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "LearningPlan not found",
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
