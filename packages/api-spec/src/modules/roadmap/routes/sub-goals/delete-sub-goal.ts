import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  RoadmapGoalSubGoalParamsSchema,
  SubGoalDeletionResponseSchema,
} from "../../../roadmap/schema";

export const deleteSubGoalRoute = createRoute({
  tags: ["Roadmap Sub-Goals"],
  method: "delete",
  path: "/roadmaps/{roadmapId}/goals/{goalId}/sub-goals/{subGoalId}",
  summary: "Delete a sub-goal",
  request: {
    params: RoadmapGoalSubGoalParamsSchema,
  },
  responses: {
    200: {
      description: "Sub-goal deleted successfully",
      content: {
        "application/json": {
          schema: SubGoalDeletionResponseSchema,
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
