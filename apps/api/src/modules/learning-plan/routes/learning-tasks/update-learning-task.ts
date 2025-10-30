import { OpenAPIHono } from "@hono/zod-openapi";
import { updateLearningTaskRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/update-learning-task";
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
import { LearningPlanError } from "../../errors";

import type { LearningTaskUpdate } from "@repo/database/types";
import type { AuthContext } from "../../../../middleware/auth";
import type { LearningTaskNoteStatus } from "../../../ai/services/learning-task-note-service";

const updateLearningTask = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...updateLearningTaskRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { learningPlanId, learningTaskId } = c.req.valid("param");
      const body = c.req.valid("json");

      // Check if learningPlan exists and user owns it
      const [learningPlanResult] = await db
        .select({
          id: learningPlan.id,
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
          "You do not have permission to modify this learningPlan",
        );
      }

      // Check if learning-task exists and belongs to this learningModule
      const [learningTaskResult] = await db
        .select({
          id: learningTask.id,
          learningModuleId: learningTask.learningModuleId,
          isCompleted: learningTask.isCompleted,
          completedAt: learningTask.completedAt,
        })
        .from(learningTask)
        .where(eq(learningTask.publicId, learningTaskId))
        .limit(1);

      if (!learningTaskResult) {
        throw new LearningPlanError(
          404,
          "learning_plan:learning_task_not_found",
          "Learning-task not found",
        );
      }

      // Check if learningModule exists and belongs to this learningPlan
      const [learningModuleResult] = await db
        .select({
          id: learningModule.id,
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

      if (learningModuleResult.learningPlanId !== learningPlanResult.id) {
        throw new LearningPlanError(
          404,
          "learning_plan:learning_module_not_found",
          "Learning module does not belong to this learningPlan",
        );
      }

      // Prepare update data
      const updateData: LearningTaskUpdate = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined)
        updateData.description = body.description || null;
      if (body.isCompleted !== undefined) {
        const isCompleting =
          body.isCompleted && !learningTaskResult.isCompleted;
        const isReopening = !body.isCompleted && learningTaskResult.isCompleted;

        updateData.isCompleted = body.isCompleted;

        if (isCompleting) {
          updateData.completedAt = new Date();
        } else if (isReopening) {
          updateData.completedAt = null;
        }
      }
      if (body.dueDate !== undefined)
        updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
      if (body.memo !== undefined) updateData.memo = body.memo || null;

      // Always update the updatedAt field
      updateData.updatedAt = new Date();

      // Update learning-task in database
      const [updatedLearningTask] = await db
        .update(learningTask)
        .set(updateData)
        .where(eq(learningTask.id, learningTaskResult.id))
        .returning({
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
        });

      if (!updatedLearningTask) {
        throw new LearningPlanError(
          500,
          "learning_plan:learning_task_update_failed",
          "Failed to update learning-task",
        );
      }

      const [noteRow] = await db
        .select({
          status: aiNote.status,
          markdown: aiNote.markdown,
          requestedAt: aiNote.requestedAt,
          completedAt: aiNote.completedAt,
          errorMessage: aiNote.errorMessage,
        })
        .from(aiNote)
        .where(eq(aiNote.learningTaskId, learningTaskResult.id))
        .limit(1);

      const noteStatus =
        (noteRow?.status as LearningTaskNoteStatus | null) ??
        LEARNING_TASK_NOTE_STATUS.idle;

      // Format response
      return c.json(
        {
          id: updatedLearningTask.publicId,
          title: updatedLearningTask.title,
          description: updatedLearningTask.description,
          isCompleted: updatedLearningTask.isCompleted,
          completedAt: updatedLearningTask.completedAt?.toISOString() ?? null,
          dueDate: updatedLearningTask.dueDate?.toISOString() ?? null,
          memo: updatedLearningTask.memo,
          order: updatedLearningTask.order,
          createdAt: updatedLearningTask.createdAt.toISOString(),
          updatedAt: updatedLearningTask.updatedAt.toISOString(),
          aiNoteStatus: noteStatus,
          aiNoteMarkdown: noteRow?.markdown ?? null,
          aiNoteRequestedAt: noteRow?.requestedAt?.toISOString() ?? null,
          aiNoteCompletedAt: noteRow?.completedAt?.toISOString() ?? null,
          aiNoteError: noteRow?.errorMessage ?? null,
        },
        status.OK,
      );
    } catch (error) {
      if (error instanceof LearningPlanError) {
        throw error;
      }

      // Handle validation errors
      if (error instanceof Error && error.message.includes("validation")) {
        throw new LearningPlanError(
          400,
          "learning_plan:learning_task_validation_failed",
          "Invalid learning-task data provided",
        );
      }

      console.error("Learning-task update error:", error);
      throw new LearningPlanError(
        500,
        "learning_plan:internal_error",
        "Failed to update learning-task",
      );
    }
  },
);

export default updateLearningTask;
