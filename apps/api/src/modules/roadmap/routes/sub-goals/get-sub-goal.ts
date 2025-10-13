import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import status from "http-status";
import { db } from "../../../../database/client";
import {
  aiNote,
  goal,
  roadmap,
  subGoal,
} from "../../../../database/schema";
import { AuthContext, authMiddleware } from "../../../../middleware/auth";
import { RoadmapError } from "../../errors";
import {
  ErrorResponseSchema,
  RoadmapGoalSubGoalParamsSchema,
  SubGoalDetailResponseSchema,
} from "../../schema";
import {
  SUB_GOAL_NOTE_STATUS,
  type SubGoalNoteStatus,
} from "../../../ai/services/subgoal-note-service";

const getSubGoal = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  createRoute({
    tags: ["Roadmap Sub-Goals"],
    method: "get",
    path: "/roadmaps/{roadmapId}/sub-goals/{subGoalId}",
    summary: "Get detailed information about a sub-goal",
    middleware: [authMiddleware] as const,
    request: {
      params: RoadmapGoalSubGoalParamsSchema,
    },
    responses: {
      [status.OK]: {
        content: {
          "application/json": {
            schema: SubGoalDetailResponseSchema,
          },
        },
        description: "Sub-goal detail retrieved successfully",
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
      const { roadmapId, subGoalId } = c.req.valid("param");

      const [roadmapResult] = await db
        .select({
          id: roadmap.id,
          publicId: roadmap.publicId,
          title: roadmap.title,
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
          "You do not have permission to view this roadmap",
        );
      }

      const [subGoalResult] = await db
        .select({
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
          noteStatus: aiNote.status,
          noteMarkdown: aiNote.markdown,
          noteRequestedAt: aiNote.requestedAt,
          noteCompletedAt: aiNote.completedAt,
          noteError: aiNote.errorMessage,
          goalId: subGoal.goalId,
        })
        .from(subGoal)
        .leftJoin(aiNote, eq(aiNote.subGoalId, subGoal.id))
        .where(eq(subGoal.publicId, subGoalId))
        .limit(1);

      if (!subGoalResult) {
        throw new RoadmapError(
          404,
          "roadmap:sub_goal_not_found",
          "Sub-goal not found",
        );
      }

      const [goalResult] = await db
        .select({
          id: goal.id,
          publicId: goal.publicId,
          title: goal.title,
          description: goal.description,
          order: goal.order,
          roadmapId: goal.roadmapId,
        })
        .from(goal)
        .where(eq(goal.id, subGoalResult.goalId))
        .limit(1);

      if (!goalResult) {
        throw new RoadmapError(404, "roadmap:goal_not_found", "Goal not found");
      }

      const noteStatus =
        (subGoalResult.noteStatus as SubGoalNoteStatus | null) ??
        SUB_GOAL_NOTE_STATUS.idle;

      return c.json(
        {
          id: subGoalResult.publicId,
          title: subGoalResult.title,
          description: subGoalResult.description,
          isCompleted: subGoalResult.isCompleted,
          dueDate: subGoalResult.dueDate?.toISOString() ?? null,
          memo: subGoalResult.memo,
          order: subGoalResult.order,
          createdAt: subGoalResult.createdAt.toISOString(),
          updatedAt: subGoalResult.updatedAt.toISOString(),
          aiNoteStatus: noteStatus,
          aiNoteMarkdown: subGoalResult.noteMarkdown,
          aiNoteRequestedAt:
            subGoalResult.noteRequestedAt?.toISOString() ?? null,
          aiNoteCompletedAt:
            subGoalResult.noteCompletedAt?.toISOString() ?? null,
          aiNoteError: subGoalResult.noteError,
          goal: {
            id: goalResult.publicId,
            title: goalResult.title,
            description: goalResult.description,
            order: goalResult.order,
          },
          roadmap: {
            id: roadmapResult.publicId,
            title: roadmapResult.title,
          },
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof RoadmapError) {
        throw error;
      }

      console.error("Sub-goal detail error:", error);
      throw new RoadmapError(
        500,
        "roadmap:internal_error",
        "Failed to load sub-goal detail",
      );
    }
  },
);

export default getSubGoal;
