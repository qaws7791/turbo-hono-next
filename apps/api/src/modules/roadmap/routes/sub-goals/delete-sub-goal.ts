import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { eq, gt, sql } from "drizzle-orm";
import { goal, roadmap, subGoal } from "@repo/database/schema";
import { deleteSubGoalRoute } from "@repo/api-spec/modules/roadmap/routes/sub-goals/delete-sub-goal";

import { db } from "../../../../database/client";
import { authMiddleware } from "../../../../middleware/auth";
import { RoadmapError } from "../../errors";

import type { AuthContext } from "../../../../middleware/auth";

const deleteSubGoal = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...deleteSubGoalRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { roadmapId, goalId, subGoalId } = c.req.valid("param");

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
          404,
          "roadmap:goal_not_found",
          "Goal does not belong to this roadmap",
        );
      }

      // Check if sub-goal exists and belongs to this goal
      const [subGoalResult] = await db
        .select({
          id: subGoal.id,
          publicId: subGoal.publicId,
          goalId: subGoal.goalId,
          order: subGoal.order,
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

      if (subGoalResult.goalId !== goalResult.id) {
        throw new RoadmapError(
          404,
          "roadmap:sub_goal_not_found",
          "Sub-goal does not belong to this goal",
        );
      }

      // Perform deletion and reorder in a transaction
      await db.transaction(async (tx) => {
        // Delete the sub-goal
        await tx.delete(subGoal).where(eq(subGoal.id, subGoalResult.id));

        // Reorder remaining sub-goals to close gaps
        // Decrease order by 1 for all sub-goals with order greater than deleted one
        await tx
          .update(subGoal)
          .set({
            order: sql`${subGoal.order} - 1`,
            updatedAt: new Date(),
          })
          .where(
            eq(subGoal.goalId, goalResult.id) &&
              gt(subGoal.order, subGoalResult.order),
          );
      });

      // Format response
      return c.json(
        {
          message: "Sub-goal deleted successfully",
          deletedId: subGoalResult.publicId,
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof RoadmapError) {
        throw error;
      }

      console.error("Sub-goal deletion error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to delete sub-goal",
      );
    }
  },
);

export default deleteSubGoal;
