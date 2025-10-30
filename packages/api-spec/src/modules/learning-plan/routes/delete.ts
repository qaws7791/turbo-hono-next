import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  LearningPlanDeletionResponseSchema,
  LearningPlanParamsSchema,
} from "../../learning-plan/schema";

export const deleteLearningPlanRoute = createRoute({
  tags: ["LearningPlan"],
  method: "delete",
  path: "/learning-plans/{id}",
  summary: "Delete a learningPlan",
  request: {
    params: LearningPlanParamsSchema,
  },
  responses: {
    200: {
      description: "LearningPlan deleted successfully",
      content: {
        "application/json": {
          schema: LearningPlanDeletionResponseSchema,
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
