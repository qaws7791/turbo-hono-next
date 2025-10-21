import { createRoute } from "@hono/zod-openapi";
import {
  ErrorResponseSchema,
  RoadmapGoalSubGoalParamsSchema,
  SubGoalDetailResponseSchema,
} from "../../../roadmap/schema";

export const getSubGoalRoute = createRoute({
  tags: ["Roadmap Sub-Goals"],
  method: "get",
  path: "/roadmaps/{roadmapId}/sub-goals/{subGoalId}",
  summary: "Get detailed information about a sub-goal",
  request: {
    params: RoadmapGoalSubGoalParamsSchema,
  },
  responses: {
    200: {
      description: "Sub-goal detail retrieved successfully",
      content: {
        "application/json": {
          schema: SubGoalDetailResponseSchema,
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
