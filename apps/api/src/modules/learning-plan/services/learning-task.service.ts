import {
  aiNote,
  learningModule,
  learningPlan,
  learningTask,
} from "@repo/database/schema";
import { eq, max, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "../../../database/client";
import { BaseError } from "../../../errors/base.error";
import { ErrorCodes } from "../../../errors/error-codes";
import { log } from "../../../lib/logger";
import { LEARNING_TASK_NOTE_STATUS } from "../../ai/services/learning-task-note-service";
import {
  loadLatestQuizForLearningTask,
  serializeQuizRecord,
} from "../../ai/services/learning-task-quiz-service";
import { LearningPlanError, LearningPlanErrors } from "../errors";

import type { LearningTaskUpdate } from "@repo/database/types";
import type { LearningTaskNoteStatus } from "../../ai/services/learning-task-note-service";

/**
 * Input type for creating a learning task
 */
export interface CreateLearningTaskInput {
  userId: string;
  learningPlanId: string; // publicId
  learningModuleId: string; // publicId
  title: string;
  description?: string | null;
  dueDate?: string | null;
  memo?: string | null;
}

/**
 * Input type for updating a learning task
 */
export interface UpdateLearningTaskInput {
  userId: string;
  learningPlanId: string; // publicId
  learningTaskId: string; // publicId
  title?: string;
  description?: string | null;
  isCompleted?: boolean;
  dueDate?: string | null;
  memo?: string | null;
}

/**
 * Input type for deleting a learning task
 */
export interface DeleteLearningTaskInput {
  userId: string;
  learningPlanId: string; // publicId
  learningTaskId: string; // publicId
}

/**
 * Input type for moving a learning task
 */
export interface MoveLearningTaskInput {
  userId: string;
  learningPlanId: string; // publicId
  learningTaskId: string; // publicId
  newLearningModuleId: string; // publicId (target module)
  newOrder?: number;
}

/**
 * Input type for getting a learning task
 */
export interface GetLearningTaskInput {
  userId: string;
  learningPlanId: string; // publicId
  learningTaskId: string; // publicId
}

/**
 * Service layer for learning task operations.
 * Handles business logic and data access for learning tasks.
 */
export class LearningTaskService {
  /**
   * Creates a new learning task
   * @param input - Learning task creation data
   * @returns Created learning task with formatted dates
   */
  async createTask(input: CreateLearningTaskInput) {
    try {
      // Check if learningPlan exists and user owns it
      const [learningPlanResult] = await db
        .select({
          id: learningPlan.id,
          userId: learningPlan.userId,
        })
        .from(learningPlan)
        .where(eq(learningPlan.publicId, input.learningPlanId))
        .limit(1);

      if (!learningPlanResult) {
        throw LearningPlanErrors.notFound();
      }

      if (learningPlanResult.userId !== input.userId) {
        throw LearningPlanErrors.accessDenied();
      }

      // Check if learningModule exists and belongs to this learningPlan
      const [learningModuleResult] = await db
        .select({
          id: learningModule.id,
          learningPlanId: learningModule.learningPlanId,
        })
        .from(learningModule)
        .where(eq(learningModule.publicId, input.learningModuleId))
        .limit(1);

      if (!learningModuleResult) {
        throw LearningPlanErrors.moduleNotFound();
      }

      if (learningModuleResult.learningPlanId !== learningPlanResult.id) {
        throw LearningPlanErrors.moduleNotFound();
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

      // Parse dueDate if provided
      const dueDateValue = input.dueDate ? new Date(input.dueDate) : null;

      // Create learning task in database
      const [createdLearningTask] = await db
        .insert(learningTask)
        .values({
          publicId,
          learningModuleId: learningModuleResult.id,
          title: input.title,
          description: input.description || null,
          dueDate: dueDateValue,
          memo: input.memo || null,
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
        throw LearningPlanErrors.taskCreationFailed();
      }

      log.info("Learning task created successfully", {
        publicId: createdLearningTask.publicId,
        learningModuleId: input.learningModuleId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
      });

      // Format response
      return {
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
      };
    } catch (error) {
      // Re-throw LearningPlanError as is
      if (error instanceof LearningPlanError) {
        throw error;
      }

      // Handle validation errors
      if (error instanceof Error && error.message.includes("validation")) {
        throw new BaseError(
          400,
          ErrorCodes.VALIDATION_INVALID_INPUT,
          "Invalid learning task data provided",
        );
      }

      // Log and throw generic error for unexpected issues
      log.error("Learning task creation failed", error, {
        learningModuleId: input.learningModuleId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
        title: input.title,
      });
      throw LearningPlanErrors.taskCreationFailed({
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Gets a learning task with all related data
   * @param input - Learning task query data
   * @returns Fully populated learning task with nested structure
   */
  async getTask(input: GetLearningTaskInput) {
    try {
      // Check if learningPlan exists and user owns it
      const [learningPlanResult] = await db
        .select({
          id: learningPlan.id,
          publicId: learningPlan.publicId,
          title: learningPlan.title,
          userId: learningPlan.userId,
        })
        .from(learningPlan)
        .where(eq(learningPlan.publicId, input.learningPlanId))
        .limit(1);

      if (!learningPlanResult) {
        throw LearningPlanErrors.notFound();
      }

      if (learningPlanResult.userId !== input.userId) {
        throw LearningPlanErrors.accessDenied();
      }

      // Get learning task with AI note information
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
        .where(eq(learningTask.publicId, input.learningTaskId))
        .limit(1);

      if (!learningTaskResult) {
        throw LearningPlanErrors.taskNotFound();
      }

      // Get learning module information
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
        throw LearningPlanErrors.moduleNotFound();
      }

      // Verify the module belongs to the learning plan
      if (learningModuleResult.learningPlanId !== learningPlanResult.id) {
        throw LearningPlanErrors.moduleNotFound();
      }

      // Get note status
      const noteStatus =
        (learningTaskResult.noteStatus as LearningTaskNoteStatus | null) ??
        LEARNING_TASK_NOTE_STATUS.idle;

      // Get latest quiz for the task
      const latestQuiz = await loadLatestQuizForLearningTask({
        learningTaskDbId: learningTaskResult.id,
        userId: input.userId,
      });
      const aiQuiz = latestQuiz
        ? serializeQuizRecord(latestQuiz.record, latestQuiz.latestResult)
        : null;

      log.info("Learning task retrieved successfully", {
        publicId: input.learningTaskId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
      });

      // Format response
      return {
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
      };
    } catch (error) {
      // Re-throw LearningPlanError as is
      if (error instanceof LearningPlanError) {
        throw error;
      }

      // Log and throw generic error for unexpected issues
      log.error("Learning task retrieval failed", error, {
        learningTaskId: input.learningTaskId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
      });
      throw LearningPlanErrors.updateFailed();
    }
  }

  /**
   * Updates an existing learning task
   * @param input - Learning task update data
   * @returns Updated learning task with formatted dates
   */
  async updateTask(input: UpdateLearningTaskInput) {
    try {
      // Check if learningPlan exists and user owns it
      const [learningPlanResult] = await db
        .select({
          id: learningPlan.id,
          userId: learningPlan.userId,
        })
        .from(learningPlan)
        .where(eq(learningPlan.publicId, input.learningPlanId))
        .limit(1);

      if (!learningPlanResult) {
        throw LearningPlanErrors.notFound();
      }

      if (learningPlanResult.userId !== input.userId) {
        throw LearningPlanErrors.accessDenied();
      }

      // Check if learning task exists
      const [learningTaskResult] = await db
        .select({
          id: learningTask.id,
          learningModuleId: learningTask.learningModuleId,
          isCompleted: learningTask.isCompleted,
          completedAt: learningTask.completedAt,
        })
        .from(learningTask)
        .where(eq(learningTask.publicId, input.learningTaskId))
        .limit(1);

      if (!learningTaskResult) {
        throw LearningPlanErrors.taskNotFound();
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
        throw LearningPlanErrors.moduleNotFound();
      }

      if (learningModuleResult.learningPlanId !== learningPlanResult.id) {
        throw LearningPlanErrors.moduleNotFound();
      }

      // Prepare update data
      const updateData: LearningTaskUpdate = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined)
        updateData.description = input.description || null;
      if (input.isCompleted !== undefined) {
        const isCompleting =
          input.isCompleted && !learningTaskResult.isCompleted;
        const isReopening =
          !input.isCompleted && learningTaskResult.isCompleted;

        updateData.isCompleted = input.isCompleted;

        if (isCompleting) {
          updateData.completedAt = new Date();
        } else if (isReopening) {
          updateData.completedAt = null;
        }
      }
      if (input.dueDate !== undefined)
        updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
      if (input.memo !== undefined) updateData.memo = input.memo || null;

      // Always update the updatedAt field
      updateData.updatedAt = new Date();

      // Update learning task in database
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
        throw LearningPlanErrors.taskUpdateFailed();
      }

      // Get AI note information
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

      log.info("Learning task updated successfully", {
        publicId: input.learningTaskId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
      });

      // Format response
      return {
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
      };
    } catch (error) {
      // Re-throw LearningPlanError or BaseError as is
      if (error instanceof LearningPlanError || error instanceof BaseError) {
        throw error;
      }

      // Handle validation errors
      if (error instanceof Error && error.message.includes("validation")) {
        throw new BaseError(
          400,
          ErrorCodes.VALIDATION_INVALID_INPUT,
          "Invalid learning task data provided",
        );
      }

      // Log and throw generic error for unexpected issues
      log.error("Learning task update failed", error, {
        learningTaskId: input.learningTaskId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
      });
      throw LearningPlanErrors.taskUpdateFailed();
    }
  }

  /**
   * Deletes a learning task and reorders remaining tasks
   * @param input - Learning task deletion data
   * @returns Success message with deleted task ID
   */
  async deleteTask(input: DeleteLearningTaskInput) {
    try {
      // Check if learningPlan exists and user owns it
      const [learningPlanResult] = await db
        .select({
          id: learningPlan.id,
          userId: learningPlan.userId,
        })
        .from(learningPlan)
        .where(eq(learningPlan.publicId, input.learningPlanId))
        .limit(1);

      if (!learningPlanResult) {
        throw LearningPlanErrors.notFound();
      }

      if (learningPlanResult.userId !== input.userId) {
        throw LearningPlanErrors.accessDenied();
      }

      // Check if learning task exists
      const [learningTaskResult] = await db
        .select({
          id: learningTask.id,
          publicId: learningTask.publicId,
          learningModuleId: learningTask.learningModuleId,
          order: learningTask.order,
        })
        .from(learningTask)
        .where(eq(learningTask.publicId, input.learningTaskId))
        .limit(1);

      if (!learningTaskResult) {
        throw LearningPlanErrors.taskNotFound();
      }

      // Verify learningModule belongs to this learningPlan
      const [learningModuleResult] = await db
        .select({
          id: learningModule.id,
          learningPlanId: learningModule.learningPlanId,
        })
        .from(learningModule)
        .where(eq(learningModule.id, learningTaskResult.learningModuleId))
        .limit(1);

      if (!learningModuleResult) {
        throw LearningPlanErrors.moduleNotFound();
      }

      if (learningModuleResult.learningPlanId !== learningPlanResult.id) {
        throw LearningPlanErrors.accessDenied();
      }

      // Perform deletion and reorder in a transaction
      await db.transaction(async (tx) => {
        // Delete the learning task
        await tx
          .delete(learningTask)
          .where(eq(learningTask.id, learningTaskResult.id));

        // Reorder remaining learning tasks to close gaps
        // Decrease order by 1 for all learning tasks with order greater than deleted one
        await tx
          .update(learningTask)
          .set({
            order: sql`${learningTask.order} - 1`,
            updatedAt: new Date(),
          })
          .where(
            sql`${learningTask.learningModuleId} = ${learningModuleResult.id} AND ${learningTask.order} > ${learningTaskResult.order}`,
          );
      });

      log.info("Learning task deleted successfully", {
        publicId: input.learningTaskId,
        learningModuleId: learningTaskResult.learningModuleId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
      });

      // Format response
      return {
        message: "Learning task deleted successfully",
        deletedId: learningTaskResult.publicId,
      };
    } catch (error) {
      // Re-throw LearningPlanError as is
      if (error instanceof LearningPlanError) {
        throw error;
      }

      // Log and throw generic error for unexpected issues
      log.error("Learning task deletion failed", error, {
        learningTaskId: input.learningTaskId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
      });
      throw LearningPlanErrors.deleteFailed();
    }
  }

  /**
   * Moves a learning task to a new position (within same module or to different module)
   * @param input - Learning task move data
   * @returns Updated learning task with new position
   */
  async moveTask(input: MoveLearningTaskInput) {
    try {
      // Check if learningPlan exists and user owns it
      const [learningPlanResult] = await db
        .select({
          id: learningPlan.id,
          userId: learningPlan.userId,
        })
        .from(learningPlan)
        .where(eq(learningPlan.publicId, input.learningPlanId))
        .limit(1);

      if (!learningPlanResult) {
        throw LearningPlanErrors.notFound();
      }

      if (learningPlanResult.userId !== input.userId) {
        throw LearningPlanErrors.accessDenied();
      }

      // Check if learning task exists
      const [learningTaskResult] = await db
        .select({
          id: learningTask.id,
          publicId: learningTask.publicId,
          learningModuleId: learningTask.learningModuleId,
          order: learningTask.order,
        })
        .from(learningTask)
        .where(eq(learningTask.publicId, input.learningTaskId))
        .limit(1);

      if (!learningTaskResult) {
        throw LearningPlanErrors.taskNotFound();
      }

      // Get current learningModule from the learning task
      const [currentLearningModuleResult] = await db
        .select({
          id: learningModule.id,
          publicId: learningModule.publicId,
          learningPlanId: learningModule.learningPlanId,
        })
        .from(learningModule)
        .where(eq(learningModule.id, learningTaskResult.learningModuleId))
        .limit(1);

      if (!currentLearningModuleResult) {
        throw LearningPlanErrors.moduleNotFound();
      }

      if (
        currentLearningModuleResult.learningPlanId !== learningPlanResult.id
      ) {
        throw LearningPlanErrors.moduleNotFound();
      }

      // Check if target learningModule exists and belongs to this learningPlan
      const [targetLearningModuleResult] = await db
        .select({
          id: learningModule.id,
          publicId: learningModule.publicId,
          learningPlanId: learningModule.learningPlanId,
        })
        .from(learningModule)
        .where(eq(learningModule.publicId, input.newLearningModuleId))
        .limit(1);

      if (!targetLearningModuleResult) {
        throw LearningPlanErrors.moduleNotFound();
      }

      if (targetLearningModuleResult.learningPlanId !== learningPlanResult.id) {
        throw LearningPlanErrors.moduleNotFound();
      }

      // Perform the move operation in a transaction
      await db.transaction(async (tx) => {
        const isSameLearningModule =
          currentLearningModuleResult.id === targetLearningModuleResult.id;

        if (isSameLearningModule) {
          // Moving within the same learningModule - reorder
          if (input.newOrder !== undefined) {
            const currentOrder = learningTaskResult.order;
            const targetOrder = input.newOrder;

            if (currentOrder !== targetOrder) {
              if (currentOrder < targetOrder) {
                // Moving down: decrease order of items between current and target
                await tx
                  .update(learningTask)
                  .set({
                    order: sql`${learningTask.order} - 1`,
                    updatedAt: new Date(),
                  })
                  .where(
                    sql`${learningTask.learningModuleId} = ${currentLearningModuleResult.id} AND ${learningTask.order} >= ${currentOrder + 1} AND ${learningTask.order} <= ${targetOrder}`,
                  );
              } else {
                // Moving up: increase order of items between target and current
                await tx
                  .update(learningTask)
                  .set({
                    order: sql`${learningTask.order} + 1`,
                    updatedAt: new Date(),
                  })
                  .where(
                    sql`${learningTask.learningModuleId} = ${currentLearningModuleResult.id} AND ${learningTask.order} >= ${targetOrder} AND ${learningTask.order} <= ${currentOrder - 1}`,
                  );
              }

              // Update the moved learning task
              await tx
                .update(learningTask)
                .set({
                  order: targetOrder,
                  updatedAt: new Date(),
                })
                .where(eq(learningTask.id, learningTaskResult.id));
            }
          }
        } else {
          // Moving to a different learningModule
          // First, close the gap in the current learningModule
          await tx
            .update(learningTask)
            .set({
              order: sql`${learningTask.order} - 1`,
              updatedAt: new Date(),
            })
            .where(
              sql`${learningTask.learningModuleId} = ${currentLearningModuleResult.id} AND ${learningTask.order} >= ${learningTaskResult.order + 1}`,
            );

          // Determine the new order in the target learningModule
          let finalOrder: number;
          if (input.newOrder !== undefined) {
            // Make space in the target learningModule at the specified position
            await tx
              .update(learningTask)
              .set({
                order: sql`${learningTask.order} + 1`,
                updatedAt: new Date(),
              })
              .where(
                sql`${learningTask.learningModuleId} = ${targetLearningModuleResult.id} AND ${learningTask.order} >= ${input.newOrder}`,
              );
            finalOrder = input.newOrder;
          } else {
            // Place at the end of the target learningModule
            const [maxOrderResult] = await tx
              .select({
                maxOrder: max(learningTask.order),
              })
              .from(learningTask)
              .where(
                eq(
                  learningTask.learningModuleId,
                  targetLearningModuleResult.id,
                ),
              );
            finalOrder = (maxOrderResult?.maxOrder || 0) + 1;
          }

          // Move the learning task to the target learningModule
          await tx
            .update(learningTask)
            .set({
              learningModuleId: targetLearningModuleResult.id,
              order: finalOrder,
              updatedAt: new Date(),
            })
            .where(eq(learningTask.id, learningTaskResult.id));
        }
      });

      // Get the final order after the move
      const [updatedLearningTask] = await db
        .select({
          order: learningTask.order,
          updatedAt: learningTask.updatedAt,
        })
        .from(learningTask)
        .where(eq(learningTask.id, learningTaskResult.id))
        .limit(1);

      if (!updatedLearningTask) {
        throw LearningPlanErrors.taskMoveFailed();
      }

      log.info("Learning task moved successfully", {
        publicId: input.learningTaskId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
        fromModuleId: currentLearningModuleResult.publicId,
        toModuleId: targetLearningModuleResult.publicId,
        newOrder: updatedLearningTask.order,
      });

      // Format response
      return {
        id: learningTaskResult.publicId,
        learningModuleId: targetLearningModuleResult.publicId,
        order: updatedLearningTask.order,
        updatedAt: updatedLearningTask.updatedAt.toISOString(),
      };
    } catch (error) {
      // Re-throw LearningPlanError or BaseError as is
      if (error instanceof LearningPlanError || error instanceof BaseError) {
        throw error;
      }

      // Handle validation errors
      if (error instanceof Error && error.message.includes("validation")) {
        throw new BaseError(
          400,
          ErrorCodes.VALIDATION_INVALID_INPUT,
          "Invalid move operation data provided",
        );
      }

      // Log and throw generic error for unexpected issues
      log.error("Learning task move failed", error, {
        learningTaskId: input.learningTaskId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
      });
      throw LearningPlanErrors.taskMoveFailed();
    }
  }
}

// Export singleton instance
export const learningTaskService = new LearningTaskService();
