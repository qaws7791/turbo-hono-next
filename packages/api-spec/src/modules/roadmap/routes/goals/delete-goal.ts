import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  GoalDeletionResponseSchema,
  RoadmapGoalParamsSchema,
} from "../../../roadmap/schema";

export const deleteGoalRoute = createRoute({
  tags: ["Roadmap Goals"],
  method: "delete",
  path: "/roadmaps/{roadmapId}/goals/{goalId}",
  summary: "Delete a goal",
  request: {
    params: RoadmapGoalParamsSchema,
  },
  responses: {
    200: {
      description: "Goal deleted successfully",
      content: {
        "application/json": {
          schema: GoalDeletionResponseSchema,
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
