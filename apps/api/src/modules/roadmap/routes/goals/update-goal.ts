import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { eq } from "drizzle-orm";
import { db } from "../../../../database/client";
import { goal, roadmap } from "../../../../database/schema";
import { authMiddleware, AuthContext } from "../../../../middleware/auth";
import { RoadmapError } from "../../errors";
import {
  ErrorResponseSchema,
  GoalUpdateRequestSchema,
  GoalUpdateResponseSchema,
  RoadmapGoalParamsSchema,
} from "../../schema";

const updateGoal = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  createRoute({
    tags: ["Roadmap Goals"],
    method: "put",
    path: "/roadmaps/{roadmapId}/goals/{goalId}",
    summary: "Update a goal",
    middleware: [authMiddleware] as const,
    request: {
      params: RoadmapGoalParamsSchema,
      body: {
        content: {
          "application/json": {
            schema: GoalUpdateRequestSchema,
          },
        },
      },
    },
    responses: {
      [status.OK]: {
        content: {
          "application/json": {
            schema: GoalUpdateResponseSchema,
          },
        },
        description: "Goal updated successfully",
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
          "roadmap:goal_access_denied",
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
          403,
          "roadmap:goal_access_denied",
          "Goal does not belong to this roadmap"
        );
      }

      // Prepare update data - only include fields that are provided
      const updateData: any = {};

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
      if (Object.keys(updateData).length === 1) { // Only updatedAt
        throw new RoadmapError(
          400,
          "roadmap:goal_validation_failed",
          "No valid fields provided for update"
        );
      }

      // Update goal in database
      const result = await db
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

      if (!result || result.length === 0) {
        throw new RoadmapError(
          500,
          "roadmap:goal_update_failed",
          "Failed to update goal"
        );
      }

      const updatedGoal = result[0];

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
          "roadmap:goal_validation_failed",
          "Invalid goal data provided"
        );
      }

      console.error("Goal update error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to update goal"
      );
    }
  }
);

export default updateGoal;