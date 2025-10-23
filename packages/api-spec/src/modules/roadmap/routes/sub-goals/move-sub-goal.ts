import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  RoadmapGoalSubGoalParamsSchema,
  SubGoalMoveRequestSchema,
  SubGoalMoveResponseSchema,
} from "../../../roadmap/schema";

export const moveSubGoalRoute = createRoute({
  tags: ["Roadmap Sub-Goals"],
  method: "patch",
  path: "/roadmaps/{roadmapId}/goals/{goalId}/sub-goals/{subGoalId}/move",
  summary: "Move a sub-goal to another goal or reorder within the same goal",
  request: {
    params: RoadmapGoalSubGoalParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: SubGoalMoveRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Sub-goal moved successfully",
      content: {
        "application/json": {
          schema: SubGoalMoveResponseSchema,
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
