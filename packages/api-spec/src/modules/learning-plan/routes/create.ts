import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanCreateRequestSchema,
  LearningPlanCreateResponseSchema,
} from "../../learning-plan/schema";

export const createLearningPlanRoute = createRoute({
  tags: ["LearningPlan"],
  method: "post",
  path: "/learning-plans",
  summary: "Create a new learningPlan",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LearningPlanCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "LearningPlan created successfully",
      content: {
        "application/json": {
          schema: LearningPlanCreateResponseSchema,
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
