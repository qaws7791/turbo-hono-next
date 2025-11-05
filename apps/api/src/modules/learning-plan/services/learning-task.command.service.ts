import { nanoid } from "nanoid";

import { ownershipHelper } from "../../../lib/authorization/ownership.helper";
import { log } from "../../../lib/logger";
import { runInTransaction } from "../../../lib/transaction.helper";
import { LearningPlanErrors } from "../errors";
import { learningModuleRepository } from "../repositories/learning-module.repository";
import { learningPlanRepository } from "../repositories/learning-plan.repository";
import { learningTaskRepository } from "../repositories/learning-task.repository";

import type { LearningTask } from "@repo/database/types";

/**
 * Input type for creating a learning task
 */
export interface CreateLearningTaskInput {
  userId: string;
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
  learningTaskId: string; // publicId
}

/**
 * Input type for moving a learning task
 */
export interface MoveLearningTaskInput {
  userId: string;
  learningTaskId: string; // publicId
  newLearningModuleId: string; // publicId (target module)
  newOrder?: number;
}

/**
 * Response type for learning task operations
 */
export interface LearningTaskResponse {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  dueDate: string | null;
  memo: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Command service for learning task operations
 * Handles create, update, delete, move operations
 */
export class LearningTaskCommandService {
  /**
   * Creates a new learning task
   */
  async createTask(
    input: CreateLearningTaskInput,
  ): Promise<LearningTaskResponse> {
    try {
      return await runInTransaction(async (tx) => {
        // Find module
        const module = await learningModuleRepository.findByPublicId(
          input.learningModuleId,
          input.userId,
          tx,
        );

        if (!module) {
          throw LearningPlanErrors.moduleNotFound();
        }

        // Find and verify plan ownership through module
        const plan = await learningPlanRepository.findById(
          module.learningPlanId,
          tx,
        );

        ownershipHelper.verifyOwnership(plan, input.userId, "Learning plan");

        // Get next order value
        const nextOrder =
          (await learningTaskRepository.getMaxOrder(module.id, tx)) + 1;

        // Generate unique public ID
        const publicId = nanoid();

        // Parse dueDate if provided
        const dueDateValue = input.dueDate ? new Date(input.dueDate) : null;

        // Create task
        const createdTask = await learningTaskRepository.create(
          {
            publicId,
            learningModuleId: module.id,
            title: input.title,
            description: input.description || null,
            dueDate: dueDateValue,
            memo: input.memo || null,
            order: nextOrder,
          },
          tx,
        );

        log.info("Learning task created successfully", {
          publicId: createdTask.publicId,
          learningModuleId: input.learningModuleId,
          userId: input.userId,
        });

        return this.formatTaskResponse(createdTask);
      });
    } catch (error) {
      log.error("Learning task creation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: input.userId,
      });
      throw LearningPlanErrors.taskCreationFailed();
    }
  }

  /**
   * Updates an existing learning task
   */
  async updateTask(
    input: UpdateLearningTaskInput,
  ): Promise<LearningTaskResponse> {
    try {
      return await runInTransaction(async (tx) => {
        // Find task with parent info
        const taskWithParents = await learningTaskRepository.findWithParents(
          input.learningTaskId,
          tx,
        );

        if (!taskWithParents) {
          throw LearningPlanErrors.taskNotFound();
        }

        // Verify plan ownership
        ownershipHelper.verifyOwnership(
          taskWithParents.plan,
          input.userId,
          "Learning plan",
        );

        // Prepare update data
        const updateData: Partial<LearningTask> = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.description !== undefined)
          updateData.description = input.description;
        if (input.memo !== undefined) updateData.memo = input.memo;
        if (input.dueDate !== undefined) {
          updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
        }
        if (input.isCompleted !== undefined) {
          updateData.isCompleted = input.isCompleted;
          updateData.completedAt = input.isCompleted ? new Date() : null;
        }

        // Update task
        const updatedTask = await learningTaskRepository.update(
          taskWithParents.id,
          updateData,
          tx,
        );

        log.info("Learning task updated successfully", {
          publicId: input.learningTaskId,
          userId: input.userId,
        });

        return this.formatTaskResponse(updatedTask);
      });
    } catch (error) {
      log.error("Learning task update failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: input.userId,
      });
      throw LearningPlanErrors.taskUpdateFailed();
    }
  }

  /**
   * Deletes a learning task
   */
  async deleteTask(
    input: DeleteLearningTaskInput,
  ): Promise<{ deletedId: string; message: string }> {
    try {
      return await runInTransaction(async (tx) => {
        // Find task with parent info
        const taskWithParents = await learningTaskRepository.findWithParents(
          input.learningTaskId,
          tx,
        );

        if (!taskWithParents) {
          throw LearningPlanErrors.taskNotFound();
        }

        // Verify plan ownership
        ownershipHelper.verifyOwnership(
          taskWithParents.plan,
          input.userId,
          "Learning plan",
        );

        // Delete task
        await learningTaskRepository.delete(taskWithParents.id, tx);

        // Adjust order of remaining tasks
        await learningTaskRepository.decrementOrdersFrom(
          taskWithParents.learningModuleId,
          taskWithParents.order + 1,
          tx,
        );

        log.info("Learning task deleted successfully", {
          publicId: input.learningTaskId,
          userId: input.userId,
        });

        return {
          deletedId: input.learningTaskId,
          message: "Learning task deleted successfully",
        };
      });
    } catch (error) {
      log.error("Learning task deletion failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: input.userId,
      });
      throw LearningPlanErrors.taskCreationFailed();
    }
  }

  /**
   * Moves a learning task to a different module or reorders within the same module
   */
  async moveTask(input: MoveLearningTaskInput): Promise<{
    id: string;
    learningModuleId: string;
    order: number;
    updatedAt: string;
  }> {
    try {
      return await runInTransaction(async (tx) => {
        // Find task with parent info
        const taskWithParents = await learningTaskRepository.findWithParents(
          input.learningTaskId,
          tx,
        );

        if (!taskWithParents) {
          throw LearningPlanErrors.taskNotFound();
        }

        // Verify plan ownership
        ownershipHelper.verifyOwnership(
          taskWithParents.plan,
          input.userId,
          "Learning plan",
        );

        // Find target module
        const targetModule = await learningModuleRepository.findByPublicId(
          input.newLearningModuleId,
          input.userId,
          tx,
        );

        if (!targetModule) {
          throw LearningPlanErrors.moduleNotFound();
        }

        // Verify target module belongs to same plan
        if (targetModule.learningPlanId !== taskWithParents.plan.id) {
          throw LearningPlanErrors.moduleNotFound();
        }

        const isSameModule =
          taskWithParents.learningModuleId === targetModule.id;
        const currentOrder = taskWithParents.order;

        if (isSameModule) {
          // Reorder within same module
          if (input.newOrder !== undefined && input.newOrder !== currentOrder) {
            const targetOrder = input.newOrder;

            if (currentOrder < targetOrder) {
              // Moving down: decrement orders between current and target
              await learningTaskRepository.decrementOrdersFrom(
                targetModule.id,
                currentOrder + 1,
                tx,
              );
            } else {
              // Moving up: increment orders between target and current
              await learningTaskRepository.incrementOrdersFrom(
                targetModule.id,
                targetOrder,
                tx,
              );
            }

            // Update task order
            const updatedTask = await learningTaskRepository.update(
              taskWithParents.id,
              { order: targetOrder },
              tx,
            );

            log.info("Learning task reordered within module", {
              publicId: input.learningTaskId,
              oldOrder: currentOrder,
              newOrder: targetOrder,
              userId: input.userId,
            });

            return {
              id: updatedTask.publicId,
              learningModuleId: targetModule.publicId,
              order: updatedTask.order,
              updatedAt: updatedTask.updatedAt.toISOString(),
            };
          }
        } else {
          // Move to different module
          // Adjust orders in source module
          await learningTaskRepository.decrementOrdersFrom(
            taskWithParents.learningModuleId,
            currentOrder + 1,
            tx,
          );

          // Determine target order
          let targetOrder = input.newOrder;
          if (targetOrder === undefined) {
            targetOrder =
              (await learningTaskRepository.getMaxOrder(targetModule.id, tx)) +
              1;
          } else {
            // Make space in target module
            await learningTaskRepository.incrementOrdersFrom(
              targetModule.id,
              targetOrder,
              tx,
            );
          }

          // Move task
          const movedTask = await learningTaskRepository.update(
            taskWithParents.id,
            {
              learningModuleId: targetModule.id,
              order: targetOrder,
            },
            tx,
          );

          log.info("Learning task moved to different module", {
            publicId: input.learningTaskId,
            sourceModuleId: taskWithParents.module.publicId,
            targetModuleId: input.newLearningModuleId,
            newOrder: targetOrder,
            userId: input.userId,
          });

          return {
            id: movedTask.publicId,
            learningModuleId: targetModule.publicId,
            order: movedTask.order,
            updatedAt: movedTask.updatedAt.toISOString(),
          };
        }

        // No change needed
        return {
          id: taskWithParents.publicId,
          learningModuleId: taskWithParents.module.publicId,
          order: taskWithParents.order,
          updatedAt: taskWithParents.updatedAt.toISOString(),
        };
      });
    } catch (error) {
      log.error("Learning task move failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: input.userId,
      });
      throw LearningPlanErrors.taskMoveFailed();
    }
  }

  /**
   * Format learning task entity to response DTO
   * @private
   */
  private formatTaskResponse(task: LearningTask): LearningTaskResponse {
    return {
      id: task.publicId,
      title: task.title,
      description: task.description,
      isCompleted: task.isCompleted,
      completedAt: task.completedAt?.toISOString() ?? null,
      dueDate: task.dueDate?.toISOString() ?? null,
      memo: task.memo,
      order: task.order,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}

/**
 * Singleton instance for convenience
 */
export const learningTaskCommandService = new LearningTaskCommandService();
