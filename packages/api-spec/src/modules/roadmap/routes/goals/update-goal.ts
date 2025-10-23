import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  GoalUpdateRequestSchema,
  GoalUpdateResponseSchema,
  RoadmapGoalParamsSchema,
} from "../../../roadmap/schema";

export const updateGoalRoute = createRoute({
  tags: ["Roadmap Goals"],
  method: "put",
  path: "/roadmaps/{roadmapId}/goals/{goalId}",
  summary: "Update a goal",
  request: {
    params: RoadmapGoalParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: GoalUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Goal updated successfully",
      content: {
        "application/json": {
          schema: GoalUpdateResponseSchema,
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
      description: "Access denied - not roadmap owner",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Goal or roadmap not found",
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
