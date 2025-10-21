import { createRoute } from "@hono/zod-openapi";
import {
  ErrorResponseSchema,
  GoalReorderRequestSchema,
  GoalReorderResponseSchema,
  RoadmapGoalParamsSchema,
} from "../../../roadmap/schema";

export const reorderGoalRoute = createRoute({
  tags: ["Roadmap Goals"],
  method: "patch",
  path: "/roadmaps/{roadmapId}/goals/{goalId}/order",
  summary: "Reorder a goal position",
  request: {
    params: RoadmapGoalParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: GoalReorderRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Goal reordered successfully",
      content: {
        "application/json": {
          schema: GoalReorderResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - invalid order position",
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
