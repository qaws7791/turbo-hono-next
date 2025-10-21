import { createRoute } from "@hono/zod-openapi";
import {
  ErrorResponseSchema,
  GoalCreateRequestSchema,
  GoalCreateResponseSchema,
  RoadmapParamsSchema,
} from "../../../roadmap/schema";

export const createGoalRoute = createRoute({
  tags: ["Roadmap Goals"],
  method: "post",
  path: "/roadmaps/{roadmapId}/goals",
  summary: "Create a new goal for a roadmap",
  request: {
    params: RoadmapParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: GoalCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Goal created successfully",
      content: {
        "application/json": {
          schema: GoalCreateResponseSchema,
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
      description: "Roadmap not found",
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
