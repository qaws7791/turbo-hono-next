import { createRoute } from "@hono/zod-openapi";
import {
  GoalActivityQuerySchema,
  GoalActivityResponseSchema,
  ProgressErrorResponseSchema,
} from "./schema";

export const dailyProgressRoute = createRoute({
  tags: ["Progress"],
  method: "get",
  path: "/progress/daily",
  summary: "Get daily goal activity (due & completed)",
  request: {
    query: GoalActivityQuerySchema,
  },
  responses: {
    200: {
      description: "Daily goal activity retrieved successfully",
      content: {
        "application/json": {
          schema: GoalActivityResponseSchema,
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
