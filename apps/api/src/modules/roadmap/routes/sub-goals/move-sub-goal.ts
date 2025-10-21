import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { eq, gte, lte, max, sql } from "drizzle-orm";
import { db } from "../../../../database/client";
import { goal, roadmap, subGoal } from "@repo/database/schema";
import { authMiddleware, AuthContext } from "../../../../middleware/auth";
import { RoadmapError } from "../../errors";
import { moveSubGoalRoute } from "@repo/api-spec/modules/roadmap/routes/sub-goals/move-sub-goal";

const moveSubGoal = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...moveSubGoalRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { roadmapId, goalId, subGoalId } = c.req.valid("param");
      const { newGoalId, newOrder } = c.req.valid("json");

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

      // Check if current goal exists and belongs to this roadmap
      const [currentGoalResult] = await db
        .select({
          id: goal.id,
          publicId: goal.publicId,
          roadmapId: goal.roadmapId,
        })
        .from(goal)
        .where(eq(goal.publicId, goalId))
        .limit(1);

      if (!currentGoalResult) {
        throw new RoadmapError(
          404,
          "roadmap:goal_not_found",
          "Current goal not found"
        );
      }

      if (currentGoalResult.roadmapId !== roadmapResult.id) {
        throw new RoadmapError(
          404,
          "roadmap:goal_not_found",
          "Current goal does not belong to this roadmap"
        );
      }

      // Check if target goal exists and belongs to this roadmap
      const [targetGoalResult] = await db
        .select({
          id: goal.id,
          publicId: goal.publicId,
          roadmapId: goal.roadmapId,
        })
        .from(goal)
        .where(eq(goal.publicId, newGoalId))
        .limit(1);

      if (!targetGoalResult) {
        throw new RoadmapError(
          404,
          "roadmap:target_goal_not_found",
          "Target goal not found"
        );
      }

      if (targetGoalResult.roadmapId !== roadmapResult.id) {
        throw new RoadmapError(
          404,
          "roadmap:target_goal_not_found",
          "Target goal does not belong to this roadmap"
        );
      }

      // Check if sub-goal exists and belongs to current goal
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
          "Sub-goal not found"
        );
      }

      if (subGoalResult.goalId !== currentGoalResult.id) {
        throw new RoadmapError(
          404,
          "roadmap:sub_goal_not_found",
          "Sub-goal does not belong to the current goal"
        );
      }

      // Perform the move operation in a transaction
      await db.transaction(async (tx) => {
        const isSameGoal = currentGoalResult.id === targetGoalResult.id;

        if (isSameGoal) {
          // Moving within the same goal - reorder
          if (newOrder !== undefined) {
            const currentOrder = subGoalResult.order;
            const targetOrder = newOrder;

            if (currentOrder !== targetOrder) {
              if (currentOrder < targetOrder) {
                // Moving down: decrease order of items between current and target
                await tx
                  .update(subGoal)
                  .set({
                    order: sql`${subGoal.order} - 1`,
                    updatedAt: new Date(),
                  })
                  .where(
                    eq(subGoal.goalId, currentGoalResult.id) &&
                    gte(subGoal.order, currentOrder + 1) &&
                    lte(subGoal.order, targetOrder)
                  );
              } else {
                // Moving up: increase order of items between target and current
                await tx
                  .update(subGoal)
                  .set({
                    order: sql`${subGoal.order} + 1`,
                    updatedAt: new Date(),
                  })
                  .where(
                    eq(subGoal.goalId, currentGoalResult.id) &&
                    gte(subGoal.order, targetOrder) &&
                    lte(subGoal.order, currentOrder - 1)
                  );
              }

              // Update the moved sub-goal
              await tx
                .update(subGoal)
                .set({
                  order: targetOrder,
                  updatedAt: new Date(),
                })
                .where(eq(subGoal.id, subGoalResult.id));
            }
          }
        } else {
          // Moving to a different goal
          // First, close the gap in the current goal
          await tx
            .update(subGoal)
            .set({
              order: sql`${subGoal.order} - 1`,
              updatedAt: new Date(),
            })
            .where(
              eq(subGoal.goalId, currentGoalResult.id) &&
              gte(subGoal.order, subGoalResult.order + 1)
            );

          // Determine the new order in the target goal
          let finalOrder: number;
          if (newOrder !== undefined) {
            // Make space in the target goal at the specified position
            await tx
              .update(subGoal)
              .set({
                order: sql`${subGoal.order} + 1`,
                updatedAt: new Date(),
              })
              .where(
                eq(subGoal.goalId, targetGoalResult.id) &&
                gte(subGoal.order, newOrder)
              );
            finalOrder = newOrder;
          } else {
            // Place at the end of the target goal
            const [maxOrderResult] = await tx
              .select({
                maxOrder: max(subGoal.order),
              })
              .from(subGoal)
              .where(eq(subGoal.goalId, targetGoalResult.id));
            finalOrder = (maxOrderResult?.maxOrder || 0) + 1;
          }

          // Move the sub-goal to the target goal
          await tx
            .update(subGoal)
            .set({
              goalId: targetGoalResult.id,
              order: finalOrder,
              updatedAt: new Date(),
            })
            .where(eq(subGoal.id, subGoalResult.id));
        }
      });

      // Get the final order after the move
      const [updatedSubGoal] = await db
        .select({
          order: subGoal.order,
          updatedAt: subGoal.updatedAt,
        })
        .from(subGoal)
        .where(eq(subGoal.id, subGoalResult.id))
        .limit(1);

      // Format response
      return c.json(
        {
          id: subGoalResult.publicId,
          goalId: targetGoalResult.publicId,
          order: updatedSubGoal.order,
          updatedAt: updatedSubGoal.updatedAt.toISOString(),
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
          "Invalid move operation data provided"
        );
      }

      console.error("Sub-goal move error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to move sub-goal"
      );
    }
  }
);

export default moveSubGoal;
