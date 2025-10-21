import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  RoadmapParamsSchema,
  RoadmapUpdateRequestSchema,
  RoadmapUpdateResponseSchema,
} from "../../roadmap/schema";

export const updateRoadmapRoute = createRoute({
  tags: ["Roadmap"],
  method: "patch",
  path: "/roadmaps/{id}",
  summary: "Update a roadmap",
  request: {
    params: RoadmapParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: RoadmapUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Roadmap updated successfully",
      content: {
        "application/json": {
          schema: RoadmapUpdateResponseSchema,
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
