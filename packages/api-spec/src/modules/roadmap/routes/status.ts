import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  RoadmapParamsSchema,
  RoadmapStatusChangeRequestSchema,
  RoadmapStatusChangeResponseSchema,
} from "../../roadmap/schema";

export const roadmapStatusRoute = createRoute({
  tags: ["Roadmap"],
  method: "patch",
  path: "/roadmaps/{id}/status",
  summary: "Change roadmap status (active/archived)",
  request: {
    params: RoadmapParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: RoadmapStatusChangeRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Roadmap status changed successfully",
      content: {
        "application/json": {
          schema: RoadmapStatusChangeResponseSchema,
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
      description: "Access denied - not the owner",
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
    409: {
      description: "Roadmap already has the requested status",
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
