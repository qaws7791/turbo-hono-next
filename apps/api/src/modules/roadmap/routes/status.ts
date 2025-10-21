import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import status from "http-status";
import { db } from "../../../database/client";
import { roadmap } from "@repo/database/schema";
import { AuthContext, authMiddleware } from "../../../middleware/auth";
import { RoadmapError } from "../errors";
import { roadmapStatusRoute } from "@repo/api-spec/modules/roadmap/routes/status";

const changeStatus = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...roadmapStatusRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { roadmapId: publicId } = c.req.valid("param");
      const { status: newStatus } = c.req.valid("json");

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
          "You don't have permission to change this roadmap's status",
        );
      }

      // Check if status is already the requested status
      if (existingRoadmap[0].status === newStatus) {
        throw new RoadmapError(
          409,
          "roadmap:roadmap_already_archived",
          `Roadmap is already ${newStatus}`,
        );
      }

      // Perform the status update
      const updatedRoadmaps = await db
        .update(roadmap)
        .set({
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(roadmap.publicId, publicId))
        .returning({
          publicId: roadmap.publicId,
          status: roadmap.status,
          emoji: roadmap.emoji,
          updatedAt: roadmap.updatedAt,
        });

      if (updatedRoadmaps.length === 0) {
        throw new RoadmapError(
          500,
          "roadmap:status_change_failed",
          "Failed to change roadmap status",
        );
      }

      const updatedRoadmap = updatedRoadmaps[0];

      return c.json(
        {
          id: updatedRoadmap.publicId,
          status: updatedRoadmap.status as "active" | "archived",
          emoji: updatedRoadmap.emoji,
          updatedAt: updatedRoadmap.updatedAt.toISOString(),
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof RoadmapError) {
        throw error;
      }

      console.error("Roadmap status change error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to change roadmap status",
      );
    }
  },
);

export default changeStatus;
