import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { nanoid } from "nanoid";
import { count, eq, max } from "drizzle-orm";
import { db } from "../../../../database/client";
import { goal, roadmap } from "@repo/database/schema";
import { authMiddleware, AuthContext } from "../../../../middleware/auth";
import { RoadmapError } from "../../errors";
import {
  ErrorResponseSchema,
  GoalCreateRequestSchema,
  GoalCreateResponseSchema,
  RoadmapParamsSchema,
} from "../../schema";

const createGoal = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  createRoute({
    tags: ["Roadmap Goals"],
    method: "post",
    path: "/roadmaps/{roadmapId}/goals",
    summary: "Create a new goal for a roadmap",
    middleware: [authMiddleware] as const,
    request: {
      params: RoadmapParamsSchema,
      body: {
        content: {
          "application/json": {
            schema: GoalCreateRequestSchema,
          },
        },
      },
    },
    responses: {
      [status.CREATED]: {
        content: {
          "application/json": {
            schema: GoalCreateResponseSchema,
          },
        },
        description: "Goal created successfully",
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
        description: "Roadmap not found",
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
      const { roadmapId } = c.req.valid("param");
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

      // Get the next order value for this roadmap
      const [maxOrderResult] = await db
        .select({
          maxOrder: max(goal.order),
        })
        .from(goal)
        .where(eq(goal.roadmapId, roadmapResult.id));

      const nextOrder = (maxOrderResult?.maxOrder || 0) + 1;

      // Generate unique public ID
      const publicId = nanoid();

      // Extract request data
      const { title, description, isExpanded = true } = body;

      // Create goal in database
      const result = await db
        .insert(goal)
        .values({
          publicId,
          roadmapId: roadmapResult.id,
          title,
          description: description || null,
          order: nextOrder,
          isExpanded,
        })
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
          "roadmap:goal_creation_failed",
          "Failed to create goal"
        );
      }

      const createdGoal = result[0];

      // Format response
      return c.json(
        {
          id: createdGoal.publicId,
          title: createdGoal.title,
          description: createdGoal.description,
          order: createdGoal.order,
          isExpanded: createdGoal.isExpanded,
          createdAt: createdGoal.createdAt.toISOString(),
          updatedAt: createdGoal.updatedAt.toISOString(),
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
          "roadmap:goal_validation_failed",
          "Invalid goal data provided"
        );
      }

      console.error("Goal creation error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to create goal"
      );
    }
  }
);

export default createGoal;