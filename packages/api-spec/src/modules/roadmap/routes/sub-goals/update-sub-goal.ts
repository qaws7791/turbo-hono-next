import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  RoadmapGoalSubGoalParamsSchema,
  SubGoalUpdateRequestSchema,
  SubGoalUpdateResponseSchema,
} from "../../../roadmap/schema";

export const updateSubGoalRoute = createRoute({
  tags: ["Roadmap Sub-Goals"],
  method: "put",
  path: "/roadmaps/{roadmapId}/sub-goals/{subGoalId}",
  summary: "Update a sub-goal",
  request: {
    params: RoadmapGoalSubGoalParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: SubGoalUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Sub-goal updated successfully",
      content: {
        "application/json": {
          schema: SubGoalUpdateResponseSchema,
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
      description: "Roadmap, goal, or sub-goal not found",
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
