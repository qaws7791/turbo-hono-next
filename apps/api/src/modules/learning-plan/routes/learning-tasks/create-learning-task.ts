import { OpenAPIHono } from "@hono/zod-openapi";
import { createLearningTaskRoute } from "@repo/api-spec/modules/learning-plan/routes/learning-tasks/create-learning-task";
import {
  learningModule,
  learningPlan,
  learningTask,
} from "@repo/database/schema";
import { eq, max } from "drizzle-orm";
import status from "http-status";
import { nanoid } from "nanoid";

import { db } from "../../../../database/client";
import { authMiddleware } from "../../../../middleware/auth";
import { LEARNING_TASK_NOTE_STATUS } from "../../../ai/services/learning-task-note-service";
import { LearningPlanError } from "../../errors";

import type { AuthContext } from "../../../../middleware/auth";

const createLearningTask = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...createLearningTaskRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { learningPlanId, learningModuleId } = c.req.valid("param");
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

      // Check if learningModule exists and belongs to this learningPlan
      const [learningModuleResult] = await db
        .select({
          id: learningModule.id,
          learningPlanId: learningModule.learningPlanId,
        })
        .from(learningModule)
        .where(eq(learningModule.publicId, learningModuleId))
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

      // Get the next order value for this learningModule
      const [maxOrderResult] = await db
        .select({
          maxOrder: max(learningTask.order),
        })
        .from(learningTask)
        .where(eq(learningTask.learningModuleId, learningModuleResult.id));

      const nextOrder = (maxOrderResult?.maxOrder || 0) + 1;

      // Generate unique public ID
      const publicId = nanoid();

      // Extract request data
      const { title, description, dueDate, memo } = body;

      // Create learning-task in database
      const [createdLearningTask] = await db
        .insert(learningTask)
        .values({
          publicId,
          learningModuleId: learningModuleResult.id,
          title,
          description: description || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          memo: memo || null,
          order: nextOrder,
        })
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

      if (!createdLearningTask) {
        throw new LearningPlanError(
          500,
          "learning_plan:learning_task_creation_failed",
          "Failed to create learning-task",
        );
      }

      // Format response
      return c.json(
        {
          id: createdLearningTask.publicId,
          title: createdLearningTask.title,
          description: createdLearningTask.description,
          isCompleted: createdLearningTask.isCompleted,
          completedAt: createdLearningTask.completedAt?.toISOString() ?? null,
          dueDate: createdLearningTask.dueDate?.toISOString() ?? null,
          memo: createdLearningTask.memo,
          order: createdLearningTask.order,
          createdAt: createdLearningTask.createdAt.toISOString(),
          updatedAt: createdLearningTask.updatedAt.toISOString(),
          aiNoteStatus: LEARNING_TASK_NOTE_STATUS.idle,
          aiNoteMarkdown: null,
          aiNoteRequestedAt: null,
          aiNoteCompletedAt: null,
          aiNoteError: null,
        },
        status.CREATED,
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

      console.error("Learning-task creation error:", error);
      throw new LearningPlanError(
        500,
        "learning_plan:internal_error",
        "Failed to create learning-task",
      );
    }
  },
);

export default createLearningTask;
