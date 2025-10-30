import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanParamsSchema,
  LearningPlanStatusChangeRequestSchema,
  LearningPlanStatusChangeResponseSchema,
} from "../../learning-plan/schema";

export const learningPlanStatusRoute = createRoute({
  tags: ["LearningPlan"],
  method: "patch",
  path: "/learning-plans/{id}/status",
  summary: "Change learningPlan status (active/archived)",
  request: {
    params: LearningPlanParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: LearningPlanStatusChangeRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "LearningPlan status changed successfully",
      content: {
        "application/json": {
          schema: LearningPlanStatusChangeResponseSchema,
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
    409: {
      description: "LearningPlan already has the requested status",
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
