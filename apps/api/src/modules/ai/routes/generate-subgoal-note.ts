import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { authMiddleware, type AuthContext } from "../../../middleware/auth";
import { AIError } from "../errors";
import {
  GenerateSubGoalNoteParamsSchema,
  GenerateSubGoalNoteQuerySchema,
  GenerateSubGoalNoteResponseSchema,
} from "../schema";
import {
  prepareSubGoalNoteGeneration,
  runSubGoalNoteGeneration,
  SUB_GOAL_NOTE_STATUS,
  type SubGoalNoteRecord,
} from "../services/subgoal-note-service";

function serializeRecord(record: SubGoalNoteRecord) {
  return {
    status: record.status,
    markdown: record.markdown,
    requestedAt: record.requestedAt?.toISOString() ?? null,
    completedAt: record.completedAt?.toISOString() ?? null,
    errorMessage: record.errorMessage,
  };
}

const generateSubGoalNote = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  createRoute({
    tags: ["AI"],
    method: "post",
    path: "/ai/roadmaps/{roadmapId}/sub-goals/{subGoalId}/notes",
    summary: "Generate or refresh AI learning note for a sub-goal",
    middleware: [authMiddleware] as const,
    request: {
      params: GenerateSubGoalNoteParamsSchema,
      query: GenerateSubGoalNoteQuerySchema,
    },
    responses: {
      [status.ACCEPTED]: {
        content: {
          "application/json": {
            schema: GenerateSubGoalNoteResponseSchema,
          },
        },
        description: "Note generation started",
      },
      [status.OK]: {
        content: {
          "application/json": {
            schema: GenerateSubGoalNoteResponseSchema,
          },
        },
        description: "Existing note status returned",
      },
      [status.BAD_REQUEST]: {
        content: {
          "application/json": {
            schema: GenerateSubGoalNoteResponseSchema,
          },
        },
        description: "Invalid request",
      },
      [status.UNAUTHORIZED]: {
        content: {
          "application/json": {
            schema: GenerateSubGoalNoteResponseSchema,
          },
        },
        description: "Authentication required",
      },
      [status.FORBIDDEN]: {
        content: {
          "application/json": {
            schema: GenerateSubGoalNoteResponseSchema,
          },
        },
        description: "Access denied",
      },
      [status.NOT_FOUND]: {
        content: {
          "application/json": {
            schema: GenerateSubGoalNoteResponseSchema,
          },
        },
        description: "Target roadmap or sub-goal not found",
      },
      [status.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: GenerateSubGoalNoteResponseSchema,
          },
        },
        description: "Server error while generating the note",
      },
    },
  }),
  async (c) => {
    try {
      const auth = c.get("auth");

      if (!auth?.user?.id) {
        throw new AIError(
          401,
          "ai:authentication_required",
          "User authentication required",
        );
      }

      const { roadmapId, subGoalId } = c.req.valid("param");
      const query = c.req.valid("query") ?? {};

      const { started, record, job } = await prepareSubGoalNoteGeneration({
        userId: auth.user.id,
        roadmapPublicId: roadmapId,
        subGoalPublicId: subGoalId,
        force: query.force,
      });

      if (started && job) {
        void runSubGoalNoteGeneration(job);
        return c.json(serializeRecord(record), status.ACCEPTED);
      }

      return c.json(serializeRecord(record), status.OK);
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }

      console.error("AI sub-goal note generation error:", error);

      return c.json(
        {
          status: SUB_GOAL_NOTE_STATUS.failed,
          markdown: null,
          requestedAt: null,
          completedAt: null,
          errorMessage:
            "예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        },
        status.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default generateSubGoalNote;
