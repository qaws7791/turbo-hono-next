import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import status from "http-status";
import { db } from "../../../database/client";
import { roadmap } from "@repo/database/schema";
import { AuthContext, authMiddleware } from "../../../middleware/auth";
import { RoadmapError } from "../errors";
import {
  ErrorResponseSchema,
  RoadmapDeletionResponseSchema,
  RoadmapParamsSchema,
} from "../schema";

const deleteRoadmap = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  createRoute({
    tags: ["Roadmap"],
    method: "delete",
    path: "/roadmaps/{id}",
    summary: "Delete a roadmap",
    middleware: [authMiddleware] as const,
    request: {
      params: RoadmapParamsSchema,
    },
    responses: {
      [status.OK]: {
        content: {
          "application/json": {
            schema: RoadmapDeletionResponseSchema,
          },
        },
        description: "Roadmap deleted successfully",
      },
      [status.UNAUTHORIZED]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Authentication required",
      },
      [status.FORBIDDEN]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Access denied - not the owner",
      },
      [status.NOT_FOUND]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Roadmap not found",
      },
      [status.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const auth = c.get("auth");
      const { roadmapId: publicId } = c.req.valid("param");

      // Check if roadmap exists and user has access
      const existingRoadmap = await db
        .select({
          id: roadmap.id,
          userId: roadmap.userId,
          publicId: roadmap.publicId,
          status: roadmap.status,
        })
        .from(roadmap)
        .where(eq(roadmap.publicId, publicId))
        .limit(1);

      if (existingRoadmap.length === 0) {
        throw new RoadmapError(
          404,
          "roadmap:roadmap_not_found",
          "Roadmap not found",
        );
      }

      if (existingRoadmap[0].userId !== auth.user.id) {
        throw new RoadmapError(
          403,
          "roadmap:access_denied",
          "You don't have permission to delete this roadmap",
        );
      }

      // Perform the deletion (CASCADE will handle goals and subGoals)
      const deletedRoadmaps = await db
        .delete(roadmap)
        .where(eq(roadmap.publicId, publicId))
        .returning({
          publicId: roadmap.publicId,
        });

      if (deletedRoadmaps.length === 0) {
        throw new RoadmapError(
          500,
          "roadmap:deletion_failed",
          "Failed to delete roadmap",
        );
      }

      return c.json(
        {
          message: "Roadmap deleted successfully",
          deletedId: publicId,
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof RoadmapError) {
        throw error;
      }

      console.error("Roadmap deletion error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to delete roadmap",
      );
    }
  },
);

export default deleteRoadmap;