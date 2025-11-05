import { OpenAPIHono } from "@hono/zod-openapi";
import status from "http-status";
import { generateLearningTaskNoteRoute } from "@repo/api-spec/modules/ai/routes";

import { authMiddleware } from "../../../middleware/auth";
import { AuthErrors } from "../../auth/errors";
import { AIError } from "../errors";
import {
  LEARNING_TASK_NOTE_STATUS,
  prepareLearningTaskNoteGeneration,
  runLearningTaskNoteGeneration,
} from "../services/learning-task-note-service";

import type { AuthContext } from "../../../middleware/auth";
import type { LearningTaskNoteRecord } from "../services/learning-task-note-service";

function serializeRecord(record: LearningTaskNoteRecord) {
  return {
    status: record.status,
    markdown: record.markdown,
    requestedAt: record.requestedAt?.toISOString() ?? null,
    completedAt: record.completedAt?.toISOString() ?? null,
    errorMessage: record.errorMessage,
  };
}

const generateLearningTaskNote = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...generateLearningTaskNoteRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");

      if (!auth?.user?.id) {
        throw AuthErrors.unauthorized();
      }

      const { id } = c.req.valid("param");
      const query = c.req.valid("query") ?? {};

      const { started, record, job } = await prepareLearningTaskNoteGeneration({
        userId: auth.user.id,
        learningTaskPublicId: id,
        force: query.force,
      });

      if (started && job) {
        void runLearningTaskNoteGeneration(job);
        return c.json(serializeRecord(record), status.ACCEPTED);
      }

      return c.json(serializeRecord(record), status.OK);
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }

      console.error("AI learning-task note generation error:", error);

      return c.json(
        {
          status: LEARNING_TASK_NOTE_STATUS.failed,
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

export default generateLearningTaskNote;
