import { createRoute } from "@hono/zod-openapi";
import {
  ErrorResponseSchema,
  RoadmapDetailResponseSchema,
  RoadmapParamsSchema,
} from "../../roadmap/schema";

export const roadmapDetailRoute = createRoute({
  tags: ["Roadmap"],
  method: "get",
  path: "/roadmaps/{roadmapId}",
  summary: "Get detailed roadmap with goals and sub-goals",
  request: {
    params: RoadmapParamsSchema,
  },
  responses: {
    200: {
      description: "Roadmap details retrieved successfully",
      content: {
        "application/json": {
          schema: RoadmapDetailResponseSchema,
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
      description: "Access denied to this roadmap",
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
