import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { eq } from "drizzle-orm";
import { goal, roadmap } from "@repo/database/schema";
import { updateGoalRoute } from "@repo/api-spec/modules/roadmap/routes/goals/update-goal";

import { db } from "../../../../database/client";
import { authMiddleware } from "../../../../middleware/auth";
import { RoadmapError } from "../../errors";

import type { AuthContext } from "../../../../middleware/auth";

const updateGoal = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...updateGoalRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { roadmapId, goalId } = c.req.valid("param");
      const body = c.req.valid("json");

      // Check if roadmap exists and user owns it
      const [roadmapResult] = await db
        .select({
          id: roadmap.id,
          userId: roadmap.userId,
        })
        .from(roadmap)
        .where(eq(roadmap.publicId, roadmapId))
        .limit(1);

      if (!roadmapResult) {
        throw new RoadmapError(
          404,
          "roadmap:roadmap_not_found",
          "Roadmap not found",
        );
      }

      if (roadmapResult.userId !== auth.user.id) {
        throw new RoadmapError(
          403,
          "roadmap:goal_access_denied",
          "You do not have permission to modify this roadmap",
        );
      }

      // Check if goal exists and belongs to this roadmap
      const [goalResult] = await db
        .select({
          id: goal.id,
          roadmapId: goal.roadmapId,
        })
        .from(goal)
        .where(eq(goal.publicId, goalId))
        .limit(1);

      if (!goalResult) {
        throw new RoadmapError(404, "roadmap:goal_not_found", "Goal not found");
      }

      if (goalResult.roadmapId !== roadmapResult.id) {
        throw new RoadmapError(
          403,
          "roadmap:goal_access_denied",
          "Goal does not belong to this roadmap",
        );
      }

      // Prepare update data - only include fields that are provided
      const updateData: Partial<typeof goal.$inferInsert> = {};

      if (body.title !== undefined) {
        updateData.title = body.title;
      }

      if (body.description !== undefined) {
        updateData.description = body.description || null;
      }

      if (body.isExpanded !== undefined) {
        updateData.isExpanded = body.isExpanded;
      }

      // Add updated timestamp
      updateData.updatedAt = new Date();

      // If no fields to update, return error
      if (Object.keys(updateData).length === 1) {
        // Only updatedAt
        throw new RoadmapError(
          400,
          "roadmap:goal_validation_failed",
          "No valid fields provided for update",
        );
      }

      // Update goal in database
      const [updatedGoal] = await db
        .update(goal)
        .set(updateData)
        .where(eq(goal.id, goalResult.id))
        .returning({
          id: goal.id,
          publicId: goal.publicId,
          title: goal.title,
          description: goal.description,
          order: goal.order,
          isExpanded: goal.isExpanded,
          createdAt: goal.createdAt,
          updatedAt: goal.updatedAt,
        });

      if (!updatedGoal) {
        throw new RoadmapError(
          500,
          "roadmap:goal_update_failed",
          "Failed to update goal",
        );
      }

      // Format response
      return c.json(
        {
          id: updatedGoal.publicId,
          title: updatedGoal.title,
          description: updatedGoal.description,
          order: updatedGoal.order,
          isExpanded: updatedGoal.isExpanded,
          createdAt: updatedGoal.createdAt.toISOString(),
          updatedAt: updatedGoal.updatedAt.toISOString(),
          aiNoteStatus: "idle" as const,
          aiNoteMarkdown: null,
          aiNoteRequestedAt: null,
          aiNoteCompletedAt: null,
          aiNoteError: null,
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof RoadmapError) {
        throw error;
      }

      // Handle validation errors
      if (error instanceof Error && error.message.includes("validation")) {
        throw new RoadmapError(
          400,
          "roadmap:goal_validation_failed",
          "Invalid goal data provided",
        );
      }

      console.error("Goal update error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to update goal",
      );
    }
  },
);

export default updateGoal;
