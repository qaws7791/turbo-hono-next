import { OpenAPIHono } from "@hono/zod-openapi";
import { getLearningTaskRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/get-learning-task";
import {
  aiNote,
  learningModule,
  learningPlan,
  learningTask,
} from "@repo/database/schema";
import { eq } from "drizzle-orm";
import status from "http-status";

import { db } from "../../../../database/client";
import { authMiddleware } from "../../../../middleware/auth";
import { LEARNING_TASK_NOTE_STATUS } from "../../../ai/services/learning-task-note-service";
import {
  loadLatestQuizForLearningTask,
  serializeQuizRecord,
} from "../../../ai/services/learning-task-quiz-service";
import { LearningPlanError } from "../../errors";

import type { AuthContext } from "../../../../middleware/auth";
import type { LearningTaskNoteStatus } from "../../../ai/services/learning-task-note-service";

const getLearningTask = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...getLearningTaskRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { learningPlanId, learningTaskId } = c.req.valid("param");

      const [learningPlanResult] = await db
        .select({
          id: learningPlan.id,
          publicId: learningPlan.publicId,
          title: learningPlan.title,
          userId: learningPlan.userId,
        })
        .from(learningPlan)
        .where(eq(learningPlan.publicId, learningPlanId))
        .limit(1);
      if (!learningPlanResult) {
        throw new LearningPlanError(
          404,
          "learning_plan:learning_plan_not_found",
          "Learning plan not found",
        );
      }

      if (learningPlanResult.userId !== auth.user.id) {
        throw new LearningPlanError(
          403,
          "learning_plan:access_denied",
          "You do not have permission to view this learningPlan",
        );
      }

      const [learningTaskResult] = await db
        .select({
          id: learningTask.id,
          publicId: learningTask.publicId,
          title: learningTask.title,
          description: learningTask.description,
          isCompleted: learningTask.isCompleted,
          completedAt: learningTask.completedAt,
          dueDate: learningTask.dueDate,
          memo: learningTask.memo,
          order: learningTask.order,
          createdAt: learningTask.createdAt,
          updatedAt: learningTask.updatedAt,
          noteStatus: aiNote.status,
          noteMarkdown: aiNote.markdown,
          noteRequestedAt: aiNote.requestedAt,
          noteCompletedAt: aiNote.completedAt,
          noteError: aiNote.errorMessage,
          learningModuleId: learningTask.learningModuleId,
        })
        .from(learningTask)
        .leftJoin(aiNote, eq(aiNote.learningTaskId, learningTask.id))
        .where(eq(learningTask.publicId, learningTaskId))
        .limit(1);

      if (!learningTaskResult) {
        throw new LearningPlanError(
          404,
          "learning_plan:learning_task_not_found",
          "Learning-task not found",
        );
      }

      const [learningModuleResult] = await db
        .select({
          id: learningModule.id,
          publicId: learningModule.publicId,
          title: learningModule.title,
          description: learningModule.description,
          order: learningModule.order,
          learningPlanId: learningModule.learningPlanId,
        })
        .from(learningModule)
        .where(eq(learningModule.id, learningTaskResult.learningModuleId))
        .limit(1);

      if (!learningModuleResult) {
        throw new LearningPlanError(
          404,
          "learning_plan:learning_module_not_found",
          "Learning module not found",
        );
      }

      const noteStatus =
        (learningTaskResult.noteStatus as LearningTaskNoteStatus | null) ??
        LEARNING_TASK_NOTE_STATUS.idle;

      const latestQuiz = await loadLatestQuizForLearningTask({
        learningTaskDbId: learningTaskResult.id,
        userId: auth.user.id,
      });
      const aiQuiz = latestQuiz
        ? serializeQuizRecord(latestQuiz.record, latestQuiz.latestResult)
        : null;

      return c.json(
        {
          id: learningTaskResult.publicId,
          title: learningTaskResult.title,
          description: learningTaskResult.description,
          isCompleted: learningTaskResult.isCompleted,
          completedAt: learningTaskResult.completedAt?.toISOString() ?? null,
          dueDate: learningTaskResult.dueDate?.toISOString() ?? null,
          memo: learningTaskResult.memo,
          order: learningTaskResult.order,
          createdAt: learningTaskResult.createdAt.toISOString(),
          updatedAt: learningTaskResult.updatedAt.toISOString(),
          aiNoteStatus: noteStatus,
          aiNoteMarkdown: learningTaskResult.noteMarkdown,
          aiNoteRequestedAt:
            learningTaskResult.noteRequestedAt?.toISOString() ?? null,
          aiNoteCompletedAt:
            learningTaskResult.noteCompletedAt?.toISOString() ?? null,
          aiNoteError: learningTaskResult.noteError,
          learningModule: {
            id: learningModuleResult.publicId,
            title: learningModuleResult.title,
            description: learningModuleResult.description,
            order: learningModuleResult.order,
          },
          learningPlan: {
            id: learningPlanResult.publicId,
            title: learningPlanResult.title,
          },
          aiQuiz,
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof LearningPlanError) {
        throw error;
      }

      console.error("Learning-task detail error:", error);
      throw new LearningPlanError(
        500,
        "learning_plan:internal_error",
        "Failed to load learning-task detail",
      );
    }
  },
);

export default getLearningTask;
