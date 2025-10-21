import { createRoute } from "@hono/zod-openapi";
import {
  ErrorResponseSchema,
  RoadmapDeletionResponseSchema,
  RoadmapParamsSchema,
} from "../../roadmap/schema";

export const deleteRoadmapRoute = createRoute({
  tags: ["Roadmap"],
  method: "delete",
  path: "/roadmaps/{id}",
  summary: "Delete a roadmap",
  request: {
    params: RoadmapParamsSchema,
  },
  responses: {
    200: {
      description: "Roadmap deleted successfully",
      content: {
        "application/json": {
          schema: RoadmapDeletionResponseSchema,
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
