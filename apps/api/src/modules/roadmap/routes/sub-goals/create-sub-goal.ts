import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { nanoid } from "nanoid";
import { eq, max } from "drizzle-orm";
import { db } from "../../../../database/client";
import { goal, roadmap, subGoal } from "@repo/database/schema";
import { SUB_GOAL_NOTE_STATUS } from "../../../ai/services/subgoal-note-service";
import { authMiddleware, AuthContext } from "../../../../middleware/auth";
import { RoadmapError } from "../../errors";
import { createSubGoalRoute } from "@repo/api-spec/modules/roadmap/routes/sub-goals/create-sub-goal";

const createSubGoal = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...createSubGoalRoute,
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

      // Get the next order value for this goal
      const [maxOrderResult] = await db
        .select({
          maxOrder: max(subGoal.order),
        })
        .from(subGoal)
        .where(eq(subGoal.goalId, goalResult.id));

      const nextOrder = (maxOrderResult?.maxOrder || 0) + 1;

      // Generate unique public ID
      const publicId = nanoid();

      // Extract request data
      const { title, description, dueDate, memo } = body;

      // Create sub-goal in database
      const result = await db
        .insert(subGoal)
        .values({
          publicId,
          goalId: goalResult.id,
          title,
          description: description || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          memo: memo || null,
          order: nextOrder,
        })
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
          "roadmap:sub_goal_creation_failed",
          "Failed to create sub-goal"
        );
      }

      const createdSubGoal = result[0];

      // Format response
      return c.json(
        {
          id: createdSubGoal.publicId,
          title: createdSubGoal.title,
          description: createdSubGoal.description,
          isCompleted: createdSubGoal.isCompleted,
          completedAt: createdSubGoal.completedAt?.toISOString() ?? null,
          dueDate: createdSubGoal.dueDate?.toISOString() ?? null,
          memo: createdSubGoal.memo,
          order: createdSubGoal.order,
          createdAt: createdSubGoal.createdAt.toISOString(),
          updatedAt: createdSubGoal.updatedAt.toISOString(),
          aiNoteStatus: SUB_GOAL_NOTE_STATUS.idle,
          aiNoteMarkdown: null,
          aiNoteRequestedAt: null,
          aiNoteCompletedAt: null,
          aiNoteError: null,
        },
        status.CREATED
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

      console.error("Sub-goal creation error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to create sub-goal"
      );
    }
  }
);

export default createSubGoal;
