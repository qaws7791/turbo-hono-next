import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { eq, gt, sql } from "drizzle-orm";
import { db } from "../../../../database/client";
import { goal, roadmap, subGoal } from "@repo/database/schema";
import { authMiddleware, AuthContext } from "../../../../middleware/auth";
import { RoadmapError } from "../../errors";
import {
  ErrorResponseSchema,
  RoadmapGoalSubGoalParamsSchema,
  SubGoalDeletionResponseSchema,
} from "../../schema";

const deleteSubGoal = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  createRoute({
    tags: ["Roadmap Sub-Goals"],
    method: "delete",
    path: "/roadmaps/{roadmapId}/goals/{goalId}/sub-goals/{subGoalId}",
    summary: "Delete a sub-goal",
    middleware: [authMiddleware] as const,
    request: {
      params: RoadmapGoalSubGoalParamsSchema,
    },
    responses: {
      [status.OK]: {
        content: {
          "application/json": {
            schema: SubGoalDeletionResponseSchema,
          },
        },
        description: "Sub-goal deleted successfully",
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
          "Sub-goal not found"
        );
      }

      if (subGoalResult.goalId !== goalResult.id) {
        throw new RoadmapError(
          404,
          "roadmap:sub_goal_not_found",
          "Sub-goal does not belong to this goal"
        );
      }

      // Perform deletion and reorder in a transaction
      await db.transaction(async (tx) => {
        // Delete the sub-goal
        await tx
          .delete(subGoal)
          .where(eq(subGoal.id, subGoalResult.id));

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
            gt(subGoal.order, subGoalResult.order)
          );
      });

      // Format response
      return c.json(
        {
          message: "Sub-goal deleted successfully",
          deletedId: subGoalResult.publicId,
        },
        status.OK
      );
    } catch (error) {
      if (error instanceof RoadmapError) {
        throw error;
      }

      console.error("Sub-goal deletion error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to delete sub-goal"
      );
    }
  }
);

export default deleteSubGoal;