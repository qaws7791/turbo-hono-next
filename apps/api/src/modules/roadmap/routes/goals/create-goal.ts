import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { nanoid } from "nanoid";
import { eq, max } from "drizzle-orm";
import { goal, roadmap } from "@repo/database/schema";
import { createGoalRoute } from "@repo/api-spec/modules/roadmap/routes/goals/create-goal";

import { db } from "../../../../database/client";
import { authMiddleware } from "../../../../middleware/auth";
import { RoadmapError } from "../../errors";

import type { AuthContext } from "../../../../middleware/auth";

const createGoal = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...createGoalRoute,
    middleware: [authMiddleware] as const,
  },
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
      const [createdGoal] = await db
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

      if (!createdGoal) {
        throw new RoadmapError(
          500,
          "roadmap:goal_creation_failed",
          "Failed to create goal",
        );
      }

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
          aiNoteStatus: "idle" as const,
          aiNoteMarkdown: null,
          aiNoteRequestedAt: null,
          aiNoteCompletedAt: null,
          aiNoteError: null,
        },
        status.CREATED,
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
          "Invalid goal data provided",
        );
      }

      console.error("Goal creation error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to create goal",
      );
    }
  },
);

export default createGoal;
