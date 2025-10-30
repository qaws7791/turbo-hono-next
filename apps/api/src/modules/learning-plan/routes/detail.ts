import { OpenAPIHono } from "@hono/zod-openapi";
import { learningPlanDetailRoute } from "@repo/api-spec/modules/learning-plan/routes/detail";
import {
  aiNote,
  learningModule,
  learningPlan,
  learningPlanDocument,
  learningTask,
} from "@repo/database/schema";
import { asc, eq } from "drizzle-orm";
import status from "http-status";

import { db } from "../../../database/client";
import { authMiddleware } from "../../../middleware/auth";
import { LEARNING_TASK_NOTE_STATUS } from "../../ai/services/learning-task-note-service";
import { LearningPlanError } from "../errors";

import type { AuthContext } from "../../../middleware/auth";
import type { LearningTaskNoteStatus } from "../../ai/services/learning-task-note-service";

const detail = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...learningPlanDetailRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const { learningPlanId } = c.req.valid("param");

      // Get learningPlan by public ID and verify ownership
      const learningPlanResult = await db
        .select()
        .from(learningPlan)
        .where(eq(learningPlan.publicId, learningPlanId))
        .limit(1);

      const learningPlanData = learningPlanResult[0];
      if (!learningPlanData) {
        throw new LearningPlanError(
          404,
          "learning_plan:learning_plan_not_found",
          "Learning plan not found",
        );
      }

      // Check if user owns the learningPlan
      if (learningPlanData.userId !== auth.user.id) {
        throw new LearningPlanError(
          403,
          "learning_plan:access_denied",
          "Access denied to this learningPlan",
        );
      }

      const documents = await db
        .select()
        .from(learningPlanDocument)
        .where(eq(learningPlanDocument.learningPlanId, learningPlanData.id))
        .then((documents) =>
          documents.map((document) => ({
            id: document.publicId,
            fileName: document.fileName,
            fileSize: document.fileSize,
            fileType: document.fileType,
            storageUrl: document.storageUrl,
            learningPlanId: document.learningPlanId,
            uploadedAt: document.uploadedAt,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
          })),
        );

      // Get learningModules with their learning-tasks
      const learningModulesResult = await db
        .select({
          // LearningModule fields
          learningModuleId: learningModule.id,
          learningModulePublicId: learningModule.publicId,
          learningModuleTitle: learningModule.title,
          learningModuleDescription: learningModule.description,
          learningModuleOrder: learningModule.order,
          learningModuleIsExpanded: learningModule.isExpanded,
          learningModuleCreatedAt: learningModule.createdAt,
          learningModuleUpdatedAt: learningModule.updatedAt,
          // LearningTask fields (nullable when no learning-tasks exist)
          learningTaskId: learningTask.id,
          learningTaskPublicId: learningTask.publicId,
          learningTaskTitle: learningTask.title,
          learningTaskDescription: learningTask.description,
          learningTaskIsCompleted: learningTask.isCompleted,
          learningTaskCompletedAt: learningTask.completedAt,
          learningTaskDueDate: learningTask.dueDate,
          learningTaskMemo: learningTask.memo,
          learningTaskOrder: learningTask.order,
          learningTaskCreatedAt: learningTask.createdAt,
          learningTaskUpdatedAt: learningTask.updatedAt,
          learningTaskNoteStatus: aiNote.status,
          learningTaskNoteMarkdown: aiNote.markdown,
          learningTaskNoteRequestedAt: aiNote.requestedAt,
          learningTaskNoteCompletedAt: aiNote.completedAt,
          learningTaskNoteError: aiNote.errorMessage,
        })
        .from(learningModule)
        .leftJoin(
          learningTask,
          eq(learningModule.id, learningTask.learningModuleId),
        )
        .leftJoin(aiNote, eq(aiNote.learningTaskId, learningTask.id))
        .where(eq(learningModule.learningPlanId, learningPlanData.id))
        .orderBy(asc(learningModule.order), asc(learningTask.order));

      // Group learningModules with their learning-tasks
      const learningModulesMap = new Map();

      for (const row of learningModulesResult) {
        if (!learningModulesMap.has(row.learningModuleId)) {
          learningModulesMap.set(row.learningModuleId, {
            id: row.learningModulePublicId,
            title: row.learningModuleTitle,
            description: row.learningModuleDescription,
            order: row.learningModuleOrder,
            isExpanded: row.learningModuleIsExpanded,
            createdAt: row.learningModuleCreatedAt.toISOString(),
            updatedAt: row.learningModuleUpdatedAt.toISOString(),
            learningTasks: [],
          });
        }

        // Add learning-task if it exists
        if (row.learningTaskId) {
          const parentLearningModule = learningModulesMap.get(
            row.learningModuleId,
          );
          const noteStatus =
            (row.learningTaskNoteStatus as LearningTaskNoteStatus | null) ??
            LEARNING_TASK_NOTE_STATUS.idle;

          parentLearningModule.learningTasks.push({
            id: row.learningTaskPublicId!,
            title: row.learningTaskTitle!,
            description: row.learningTaskDescription,
            isCompleted: row.learningTaskIsCompleted!,
            completedAt: row.learningTaskCompletedAt?.toISOString() ?? null,
            dueDate: row.learningTaskDueDate?.toISOString() || null,
            memo: row.learningTaskMemo,
            order: row.learningTaskOrder!,
            createdAt: row.learningTaskCreatedAt!.toISOString(),
            updatedAt: row.learningTaskUpdatedAt!.toISOString(),
            aiNoteStatus: noteStatus,
            aiNoteMarkdown: row.learningTaskNoteMarkdown,
            aiNoteRequestedAt:
              row.learningTaskNoteRequestedAt?.toISOString() ?? null,
            aiNoteCompletedAt:
              row.learningTaskNoteCompletedAt?.toISOString() ?? null,
            aiNoteError: row.learningTaskNoteError,
          });
        }
      }

      // Convert Map to sorted array
      const learningModules = Array.from(learningModulesMap.values()).sort(
        (a, b) => a.order - b.order,
      );

      // Format response
      const response = {
        id: learningPlanData.publicId,
        emoji: learningPlanData.emoji,
        title: learningPlanData.title,
        description: learningPlanData.description,
        status: learningPlanData.status as "active" | "archived",
        learningTopic: learningPlanData.learningTopic,
        userLevel: learningPlanData.userLevel,
        targetWeeks: learningPlanData.targetWeeks,
        weeklyHours: learningPlanData.weeklyHours,
        learningStyle: learningPlanData.learningStyle,
        preferredResources: learningPlanData.preferredResources,
        mainGoal: learningPlanData.mainGoal,
        additionalRequirements: learningPlanData.additionalRequirements,
        createdAt: learningPlanData.createdAt.toISOString(),
        updatedAt: learningPlanData.updatedAt.toISOString(),
        learningModules,
        documents,
      };

      return c.json(response, status.OK);
    } catch (error) {
      if (error instanceof LearningPlanError) {
        throw error;
      }

      console.error("Learning plan detail error:", error);
      throw new LearningPlanError(
        500,
        "learning_plan:internal_error",
        "Failed to retrieve learningPlan details",
      );
    }
  },
);

export default detail;
