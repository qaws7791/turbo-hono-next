import { createRoute } from "@hono/zod-openapi";

import {
  LearningModuleActivityQuerySchema,
  LearningModuleActivityResponseSchema,
  ProgressErrorResponseSchema,
} from "./schema";

export const dailyProgressRoute = createRoute({
  tags: ["Progress"],
  method: "get",
  path: "/progress/daily",
  summary: "Get daily learning module activity (due & completed)",
  request: {
    query: LearningModuleActivityQuerySchema,
  },
  responses: {
    200: {
      description: "Daily learning module activity retrieved successfully",
      content: {
        "application/json": {
          schema: LearningModuleActivityResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid date range or format",
      content: {
        "application/json": {
          schema: ProgressErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Authentication required",
      content: {
        "application/json": {
          schema: ProgressErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ProgressErrorResponseSchema,
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

export const progressRoutes = [dailyProgressRoute] as const;
