import { createRoute } from "@hono/zod-openapi";
import {
  ErrorResponseSchema,
  RoadmapListQuerySchema,
  RoadmapListResponseSchema,
} from "../../roadmap/schema";

export const roadmapListRoute = createRoute({
  tags: ["Roadmap"],
  method: "get",
  path: "/roadmaps",
  summary: "Get roadmap list with pagination and filtering",
  request: {
    query: RoadmapListQuerySchema,
  },
  responses: {
    200: {
      description: "Roadmap list retrieved successfully",
      content: {
        "application/json": {
          schema: RoadmapListResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - invalid parameters",
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
