import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  RoadmapGoalParamsSchema,
  SubGoalCreateRequestSchema,
  SubGoalCreateResponseSchema,
} from "../../../roadmap/schema";

export const createSubGoalRoute = createRoute({
  tags: ["Roadmap Sub-Goals"],
  method: "post",
  path: "/roadmaps/{roadmapId}/goals/{goalId}/sub-goals",
  summary: "Create a new sub-goal for a goal",
  request: {
    params: RoadmapGoalParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: SubGoalCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Sub-goal created successfully",
      content: {
        "application/json": {
          schema: SubGoalCreateResponseSchema,
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
      description: "Roadmap or goal not found",
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
