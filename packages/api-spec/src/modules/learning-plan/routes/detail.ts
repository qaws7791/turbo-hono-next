import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanDetailResponseSchema,
  LearningPlanParamsSchema,
} from "../../learning-plan/schema";

export const learningPlanDetailRoute = createRoute({
  tags: ["LearningPlan"],
  method: "get",
  path: "/learning-plans/{learningPlanId}",
  summary: "Get detailed learningPlan with learningModules and learning-tasks",
  request: {
    params: LearningPlanParamsSchema,
  },
  responses: {
    200: {
      description: "LearningPlan details retrieved successfully",
      content: {
        "application/json": {
          schema: LearningPlanDetailResponseSchema,
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
      description: "Access denied to this learningPlan",
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
