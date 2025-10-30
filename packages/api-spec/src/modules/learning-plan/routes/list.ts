import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanListQuerySchema,
  LearningPlanListResponseSchema,
} from "../../learning-plan/schema";

export const learningPlanListRoute = createRoute({
  tags: ["LearningPlan"],
  method: "get",
  path: "/learning-plans",
  summary: "Get learningPlan list with pagination and filtering",
  request: {
    query: LearningPlanListQuerySchema,
  },
  responses: {
    200: {
      description: "LearningPlan list retrieved successfully",
      content: {
        "application/json": {
          schema: LearningPlanListResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - invalid parameters",
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
