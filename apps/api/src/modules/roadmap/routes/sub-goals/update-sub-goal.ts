import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import status from "http-status";
import { db } from "../../../../database/client";
import { aiNote, goal, roadmap, subGoal } from "../../../../database/schema";
import { SubGoalUpdate } from "../../../../database/types";
import { AuthContext, authMiddleware } from "../../../../middleware/auth";
import { RoadmapError } from "../../errors";
import {
  ErrorResponseSchema,
  RoadmapGoalSubGoalParamsSchema,
  SubGoalUpdateRequestSchema,
  SubGoalUpdateResponseSchema,
} from "../../schema";
import {
  SUB_GOAL_NOTE_STATUS,
  type SubGoalNoteStatus,
} from "../../../ai/services/subgoal-note-service";

const updateSubGoal = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  createRoute({
    tags: ["Roadmap Sub-Goals"],
    method: "put",
    path: "/roadmaps/{roadmapId}/sub-goals/{subGoalId}",
    summary: "Update a sub-goal",
    middleware: [authMiddleware] as const,
    request: {
      params: RoadmapGoalSubGoalParamsSchema,
      body: {
        content: {
          "application/json": {
            schema: SubGoalUpdateRequestSchema,
          },
        },
      },
    },
    responses: {
      [status.OK]: {
        content: {
          "application/json": {
            schema: SubGoalUpdateResponseSchema,
          },
        },
        description: "Sub-goal updated successfully",
      },
      [status.BAD_REQUEST]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Bad request - validation failed",
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
        description: "Access denied - not roadmap owner",
      },
      [status.NOT_FOUND]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Roadmap, goal, or sub-goal not found",
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
          "Roadmap not found"
        );
      }

      if (roadmapResult.userId !== auth.user.id) {
        throw new RoadmapError(
          403,
          "roadmap:access_denied",
          "You do not have permission to modify this roadmap"
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
          "Sub-goal not found"
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
        throw new RoadmapError(
          404,
          "roadmap:goal_not_found",
          "Goal not found"
        );
      }

      if (goalResult.roadmapId !== roadmapResult.id) {
        throw new RoadmapError(
          404,
          "roadmap:goal_not_found",
          "Goal does not belong to this roadmap"
        );
      }

      // Prepare update data
      const updateData: SubGoalUpdate = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description || null;
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
      if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
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
          "Failed to update sub-goal"
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
        status.OK
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
          "Invalid sub-goal data provided"
        );
      }

      console.error("Sub-goal update error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to update sub-goal"
      );
    }
  }
);

export default updateSubGoal;
