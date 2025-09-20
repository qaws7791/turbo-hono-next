import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { eq } from "drizzle-orm";
import { db } from "../../../../database/client";
import { goal, roadmap, subGoal } from "../../../../database/schema";
import { authMiddleware, AuthContext } from "../../../../middleware/auth";
import { RoadmapError } from "../../errors";
import {
  ErrorResponseSchema,
  RoadmapGoalSubGoalParamsSchema,
  SubGoalUpdateRequestSchema,
  SubGoalUpdateResponseSchema,
} from "../../schema";

const updateSubGoal = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  createRoute({
    tags: ["Roadmap Sub-Goals"],
    method: "put",
    path: "/roadmaps/{roadmapId}/goals/{goalId}/sub-goals/{subGoalId}",
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
      const { roadmapId, goalId, subGoalId } = c.req.valid("param");
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

      // Check if sub-goal exists and belongs to this goal
      const [subGoalResult] = await db
        .select({
          id: subGoal.id,
          goalId: subGoal.goalId,
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

      // Prepare update data
      const updateData: any = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description || null;
      if (body.isCompleted !== undefined) updateData.isCompleted = body.isCompleted;
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

      // Format response
      return c.json(
        {
          id: updatedSubGoal.publicId,
          title: updatedSubGoal.title,
          description: updatedSubGoal.description,
          isCompleted: updatedSubGoal.isCompleted,
          dueDate: updatedSubGoal.dueDate?.toISOString() || null,
          memo: updatedSubGoal.memo,
          order: updatedSubGoal.order,
          createdAt: updatedSubGoal.createdAt.toISOString(),
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