import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import status from "http-status";
import { aiNote, goal, roadmap, subGoal } from "@repo/database/schema";
import { updateSubGoalRoute } from "@repo/api-spec/modules/roadmap/routes/sub-goals/update-sub-goal";

import { db } from "../../../../database/client";
import { authMiddleware } from "../../../../middleware/auth";
import { RoadmapError } from "../../errors";
import {
  SUB_GOAL_NOTE_STATUS
  
} from "../../../ai/services/subgoal-note-service";

import type { AuthContext} from "../../../../middleware/auth";
import type { SubGoalUpdate } from "@repo/database/types";
import type {SubGoalNoteStatus} from "../../../ai/services/subgoal-note-service";

const updateSubGoal = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...updateSubGoalRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { roadmapId, subGoalId } = c.req.valid("param");
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
          "roadmap:access_denied",
          "You do not have permission to modify this roadmap",
        );
      }

      // Check if sub-goal exists and belongs to this goal
      const [subGoalResult] = await db
        .select({
          id: subGoal.id,
          goalId: subGoal.goalId,
          isCompleted: subGoal.isCompleted,
          completedAt: subGoal.completedAt,
        })
        .from(subGoal)
        .where(eq(subGoal.publicId, subGoalId))
        .limit(1);

      if (!subGoalResult) {
        throw new RoadmapError(
          404,
          "roadmap:sub_goal_not_found",
          "Sub-goal not found",
        );
      }

      // Check if goal exists and belongs to this roadmap
      const [goalResult] = await db
        .select({
          id: goal.id,
          roadmapId: goal.roadmapId,
        })
        .from(goal)
        .where(eq(goal.id, subGoalResult.goalId))
        .limit(1);

      if (!goalResult) {
        throw new RoadmapError(404, "roadmap:goal_not_found", "Goal not found");
      }

      if (goalResult.roadmapId !== roadmapResult.id) {
        throw new RoadmapError(
          404,
          "roadmap:goal_not_found",
          "Goal does not belong to this roadmap",
        );
      }

      // Prepare update data
      const updateData: SubGoalUpdate = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined)
        updateData.description = body.description || null;
      if (body.isCompleted !== undefined) {
        const isCompleting = body.isCompleted && !subGoalResult.isCompleted;
        const isReopening = !body.isCompleted && subGoalResult.isCompleted;

        updateData.isCompleted = body.isCompleted;

        if (isCompleting) {
          updateData.completedAt = new Date();
        } else if (isReopening) {
          updateData.completedAt = null;
        }
      }
      if (body.dueDate !== undefined)
        updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
      if (body.memo !== undefined) updateData.memo = body.memo || null;

      // Always update the updatedAt field
      updateData.updatedAt = new Date();

      // Update sub-goal in database
      const result = await db
        .update(subGoal)
        .set(updateData)
        .where(eq(subGoal.id, subGoalResult.id))
        .returning({
          id: subGoal.id,
          publicId: subGoal.publicId,
          title: subGoal.title,
          description: subGoal.description,
          isCompleted: subGoal.isCompleted,
          completedAt: subGoal.completedAt,
          dueDate: subGoal.dueDate,
          memo: subGoal.memo,
          order: subGoal.order,
          createdAt: subGoal.createdAt,
          updatedAt: subGoal.updatedAt,
        });

      if (!result || result.length === 0) {
        throw new RoadmapError(
          500,
          "roadmap:sub_goal_update_failed",
          "Failed to update sub-goal",
        );
      }

      const updatedSubGoal = result[0];

      const [noteRow] = await db
        .select({
          status: aiNote.status,
          markdown: aiNote.markdown,
          requestedAt: aiNote.requestedAt,
          completedAt: aiNote.completedAt,
          errorMessage: aiNote.errorMessage,
        })
        .from(aiNote)
        .where(eq(aiNote.subGoalId, subGoalResult.id))
        .limit(1);

      const noteStatus =
        (noteRow?.status as SubGoalNoteStatus | null) ??
        SUB_GOAL_NOTE_STATUS.idle;

      // Format response
      return c.json(
        {
          id: updatedSubGoal.publicId,
          title: updatedSubGoal.title,
          description: updatedSubGoal.description,
          isCompleted: updatedSubGoal.isCompleted,
          completedAt: updatedSubGoal.completedAt?.toISOString() ?? null,
          dueDate: updatedSubGoal.dueDate?.toISOString() ?? null,
          memo: updatedSubGoal.memo,
          order: updatedSubGoal.order,
          createdAt: updatedSubGoal.createdAt.toISOString(),
          updatedAt: updatedSubGoal.updatedAt.toISOString(),
          aiNoteStatus: noteStatus,
          aiNoteMarkdown: noteRow?.markdown ?? null,
          aiNoteRequestedAt: noteRow?.requestedAt?.toISOString() ?? null,
          aiNoteCompletedAt: noteRow?.completedAt?.toISOString() ?? null,
          aiNoteError: noteRow?.errorMessage ?? null,
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
          "roadmap:sub_goal_validation_failed",
          "Invalid sub-goal data provided",
        );
      }

      console.error("Sub-goal update error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to update sub-goal",
      );
    }
  },
);

export default updateSubGoal;
