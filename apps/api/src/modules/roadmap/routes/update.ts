import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import status from "http-status";
import { db } from "../../../database/client";
import { roadmap } from "@repo/database/schema";
import { AuthContext, authMiddleware } from "../../../middleware/auth";
import { RoadmapError } from "../errors";
import { updateRoadmapRoute } from "@repo/api-spec/modules/roadmap/routes/update";
import { RoadmapEmoji } from "../utils/emoji";

type RoadmapInsert = typeof roadmap.$inferInsert;

const update = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...updateRoadmapRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { roadmapId: publicId } = c.req.valid("param");
      const updateData = c.req.valid("json");

      // Validate that at least one field is provided
      if (Object.keys(updateData).length === 0) {
        throw new RoadmapError(
          400,
          "roadmap:validation_failed",
          "At least one field must be provided for update",
        );
      }

      // Check if roadmap exists and user has access
      const existingRoadmap = await db
        .select({
          id: roadmap.id,
          userId: roadmap.userId,
          publicId: roadmap.publicId,
          learningTopic: roadmap.learningTopic,
          emoji: roadmap.emoji,
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
          "You don't have permission to update this roadmap",
        );
      }

      // Perform the update
      const { emoji: requestedEmoji, ...restUpdate } =
        updateData as Partial<RoadmapInsert>;

      const updatePayload: Partial<RoadmapInsert> = {
        ...restUpdate,
        updatedAt: new Date(),
      };

      if (requestedEmoji !== undefined) {
        updatePayload.emoji = RoadmapEmoji.ensure(
          requestedEmoji,
          (restUpdate.learningTopic as string | undefined) ??
            existingRoadmap[0].learningTopic,
        );
      }

      const updatedRoadmaps = await db
        .update(roadmap)
        .set({
          ...updatePayload,
        })
        .where(eq(roadmap.publicId, publicId))
        .returning({
          id: roadmap.id,
          publicId: roadmap.publicId,
          title: roadmap.title,
          description: roadmap.description,
          status: roadmap.status,
          emoji: roadmap.emoji,
          learningTopic: roadmap.learningTopic,
          userLevel: roadmap.userLevel,
          targetWeeks: roadmap.targetWeeks,
          weeklyHours: roadmap.weeklyHours,
          learningStyle: roadmap.learningStyle,
          preferredResources: roadmap.preferredResources,
          mainGoal: roadmap.mainGoal,
          additionalRequirements: roadmap.additionalRequirements,
          createdAt: roadmap.createdAt,
          updatedAt: roadmap.updatedAt,
        });

      if (updatedRoadmaps.length === 0) {
        throw new RoadmapError(
          500,
          "roadmap:update_failed",
          "Failed to update roadmap",
        );
      }

      const updatedRoadmap = updatedRoadmaps[0];

      // Format response
      const formattedRoadmap = {
        id: updatedRoadmap.publicId,
        title: updatedRoadmap.title,
        emoji: updatedRoadmap.emoji,
        description: updatedRoadmap.description,
        status: updatedRoadmap.status as "active" | "archived",
        learningTopic: updatedRoadmap.learningTopic,
        userLevel: updatedRoadmap.userLevel,
        targetWeeks: updatedRoadmap.targetWeeks,
        weeklyHours: updatedRoadmap.weeklyHours,
        learningStyle: updatedRoadmap.learningStyle,
        preferredResources: updatedRoadmap.preferredResources,
        mainGoal: updatedRoadmap.mainGoal,
        additionalRequirements: updatedRoadmap.additionalRequirements,
        createdAt: updatedRoadmap.createdAt.toISOString(),
        updatedAt: updatedRoadmap.updatedAt.toISOString(),
      };

      return c.json(formattedRoadmap, status.OK);
    } catch (error) {
      if (error instanceof RoadmapError) {
        throw error;
      }

      console.error("Roadmap update error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to update roadmap",
      );
    }
  },
);

export default update;
