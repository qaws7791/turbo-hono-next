import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { and, eq, gte, lte, sql, count } from "drizzle-orm";
import { db } from "../../../../database/client";
import { goal, roadmap } from "@repo/database/schema";
import { authMiddleware, AuthContext } from "../../../../middleware/auth";
import { RoadmapError } from "../../errors";
import {
  ErrorResponseSchema,
  GoalReorderRequestSchema,
  GoalReorderResponseSchema,
  RoadmapGoalParamsSchema,
} from "../../schema";

const reorderGoal = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  createRoute({
    tags: ["Roadmap Goals"],
    method: "patch",
    path: "/roadmaps/{roadmapId}/goals/{goalId}/order",
    summary: "Reorder a goal position",
    middleware: [authMiddleware] as const,
    request: {
      params: RoadmapGoalParamsSchema,
      body: {
        content: {
          "application/json": {
            schema: GoalReorderRequestSchema,
          },
        },
      },
    },
    responses: {
      [status.OK]: {
        content: {
          "application/json": {
            schema: GoalReorderResponseSchema,
          },
        },
        description: "Goal reordered successfully",
      },
      [status.BAD_REQUEST]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Bad request - invalid order position",
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
      const { newOrder } = c.req.valid("json");

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

      // Get total number of goals in this roadmap
      const [totalGoalsResult] = await db
        .select({
          totalGoals: count(),
        })
        .from(goal)
        .where(eq(goal.roadmapId, roadmapResult.id));

      const totalGoals = totalGoalsResult?.totalGoals || 0;

      // Validate new order position
      if (newOrder < 1 || newOrder > totalGoals) {
        throw new RoadmapError(
          400,
          "roadmap:goal_order_out_of_range",
          `Order position must be between 1 and ${totalGoals}`
        );
      }

      const currentOrder = goalResult.order;

      // If the order is the same, no need to update
      if (currentOrder === newOrder) {
        return c.json(
          {
            id: goalResult.publicId,
            order: currentOrder,
            updatedAt: new Date().toISOString(),
          },
          status.OK
        );
      }

      // Use transaction to reorder goals
      const result = await db.transaction(async (tx) => {
        if (currentOrder < newOrder) {
          // Moving down: decrease order of goals between current and new position
          await tx
            .update(goal)
            .set({
              order: sql`${goal.order} - 1`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(goal.roadmapId, roadmapResult.id),
                gte(goal.order, currentOrder + 1),
                lte(goal.order, newOrder)
              )
            );
        } else {
          // Moving up: increase order of goals between new and current position
          await tx
            .update(goal)
            .set({
              order: sql`${goal.order} + 1`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(goal.roadmapId, roadmapResult.id),
                gte(goal.order, newOrder),
                lte(goal.order, currentOrder - 1)
              )
            );
        }

        // Update the target goal's order
        const updatedGoal = await tx
          .update(goal)
          .set({
            order: newOrder,
            updatedAt: new Date(),
          })
          .where(eq(goal.id, goalResult.id))
          .returning({
            id: goal.id,
            publicId: goal.publicId,
            order: goal.order,
            updatedAt: goal.updatedAt,
          });

        return updatedGoal[0];
      });

      if (!result) {
        throw new RoadmapError(
          500,
          "roadmap:goal_reorder_failed",
          "Failed to reorder goal"
        );
      }

      // Return success response
      return c.json(
        {
          id: result.publicId,
          order: result.order,
          updatedAt: result.updatedAt.toISOString(),
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
          "roadmap:invalid_goal_order",
          "Invalid order position provided"
        );
      }

      console.error("Goal reorder error:", error);
      throw new RoadmapError(
        500,
        "roadmap:goal_reorder_failed",
        "Failed to reorder goal"
      );
    }
  }
);

export default reorderGoal;