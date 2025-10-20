import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "../../../../database/client";
import { goal, roadmap } from "@repo/database/schema";
import { authMiddleware, AuthContext } from "../../../../middleware/auth";
import { RoadmapError } from "../../errors";
import {
  ErrorResponseSchema,
  GoalDeletionResponseSchema,
  RoadmapGoalParamsSchema,
} from "../../schema";

const deleteGoal = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  createRoute({
    tags: ["Roadmap Goals"],
    method: "delete",
    path: "/roadmaps/{roadmapId}/goals/{goalId}",
    summary: "Delete a goal",
    middleware: [authMiddleware] as const,
    request: {
      params: RoadmapGoalParamsSchema,
    },
    responses: {
      [status.OK]: {
        content: {
          "application/json": {
            schema: GoalDeletionResponseSchema,
          },
        },
        description: "Goal deleted successfully",
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
        description: "Goal or roadmap not found",
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
      const { roadmapId, goalId } = c.req.valid("param");

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
          "roadmap:goal_access_denied",
          "You do not have permission to modify this roadmap"
        );
      }

      // Check if goal exists and belongs to this roadmap
      const [goalResult] = await db
        .select({
          id: goal.id,
          publicId: goal.publicId,
          roadmapId: goal.roadmapId,
          order: goal.order,
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
          403,
          "roadmap:goal_access_denied",
          "Goal does not belong to this roadmap"
        );
      }

      // Use transaction to delete goal and reorder remaining goals
      await db.transaction(async (tx) => {
        // Delete the goal (subGoals will be deleted automatically due to cascade)
        await tx
          .delete(goal)
          .where(eq(goal.id, goalResult.id));

        // Update order of goals that come after the deleted goal
        await tx
          .update(goal)
          .set({
            order: sql`${goal.order} - 1`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(goal.roadmapId, roadmapResult.id),
              gt(goal.order, goalResult.order)
            )
          );
      });

      // Return success response
      return c.json(
        {
          message: "Goal deleted successfully",
          deletedId: goalResult.publicId,
        },
        status.OK
      );
    } catch (error) {
      if (error instanceof RoadmapError) {
        throw error;
      }

      console.error("Goal deletion error:", error);
      throw new RoadmapError(
        500,
        "roadmap:goal_deletion_failed",
        "Failed to delete goal"
      );
    }
  }
);

export default deleteGoal;