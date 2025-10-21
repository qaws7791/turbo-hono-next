import { createRoute } from "@hono/zod-openapi";

import {
  ErrorResponseSchema,
  RoadmapCreateRequestSchema,
  RoadmapCreateResponseSchema,
} from "../../roadmap/schema";

export const createRoadmapRoute = createRoute({
  tags: ["Roadmap"],
  method: "post",
  path: "/roadmaps",
  summary: "Create a new roadmap",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RoadmapCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Roadmap created successfully",
      content: {
        "application/json": {
          schema: RoadmapCreateResponseSchema,
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
