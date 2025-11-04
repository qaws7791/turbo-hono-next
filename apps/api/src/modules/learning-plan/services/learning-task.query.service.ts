import { ownershipHelper } from "../../../lib/authorization/ownership.helper";
import { log } from "../../../lib/logger";
import { LearningPlanErrors } from "../errors";
import { learningModuleRepository } from "../repositories/learning-module.repository";
import { learningPlanRepository } from "../repositories/learning-plan.repository";
import { learningTaskRepository } from "../repositories/learning-task.repository";

/**
 * Input type for getting a learning task
 */
export interface GetLearningTaskInput {
  userId: string;
  learningPlanId: string; // publicId
  learningTaskId: string; // publicId
}

/**
 * Response type for learning task detail with AI data
 */
export interface LearningTaskDetailResponse {
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
  learningPlan: {
    id: string;
    title: string;
  };
  learningModule: {
    id: string;
    title: string;
    description: string | null;
    order: number;
  };
}

/**
 * Query service for learning task operations
 * Handles read operations (queries with AI data)
 */
export class LearningTaskQueryService {
  /**
   * Gets a learning task with all related data including AI note and quiz
   */
  async getTask(
    input: GetLearningTaskInput,
  ): Promise<LearningTaskDetailResponse> {
    try {
      // Find and verify plan ownership
      const plan = await learningPlanRepository.findByPublicId(
        input.learningPlanId,
        input.userId,
      );

      ownershipHelper.verifyOwnership(plan, input.userId, "Learning plan");

      // Also get parent info
      const taskWithParents = await learningTaskRepository.findWithParents(
        input.learningTaskId,
      );

      if (!taskWithParents) {
        throw LearningPlanErrors.taskNotFound();
      }

      // Verify task belongs to plan
      if (taskWithParents.plan.id !== plan!.id) {
        throw LearningPlanErrors.taskNotFound();
      }

      log.info("Learning task retrieved successfully", {
        publicId: input.learningTaskId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
      });

      return {
        id: taskWithParents.publicId,
        title: taskWithParents.title,
        description: taskWithParents.description,
        isCompleted: taskWithParents.isCompleted,
        completedAt: taskWithParents.completedAt?.toISOString() ?? null,
        dueDate: taskWithParents.dueDate?.toISOString() ?? null,
        memo: taskWithParents.memo,
        order: taskWithParents.order,
        createdAt: taskWithParents.createdAt.toISOString(),
        updatedAt: taskWithParents.updatedAt.toISOString(),
        learningPlan: {
          id: taskWithParents.plan.publicId,
          title: taskWithParents.plan.title,
        },
        learningModule: {
          id: taskWithParents.module.publicId,
          title: taskWithParents.module.title,
          description: taskWithParents.module.description,
          order: taskWithParents.module.order,
        },
      };
    } catch (error) {
      log.error("Learning task retrieval failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        taskId: input.learningTaskId,
        userId: input.userId,
      });
      throw error;
    }
  }

  /**
   * Lists all tasks belonging to a learning module
   */
  async listTasksByModule(
    learningPlanId: string,
    learningModuleId: string,
    userId: string,
  ): Promise<
    Array<{
      id: string;
      title: string;
      description: string | null;
      order: number;
      isCompleted: boolean;
      completedAt: string | null;
      dueDate: string | null;
      memo: string | null;
      createdAt: string;
      updatedAt: string;
    }>
  > {
    try {
      // Find and verify plan ownership
      const plan = await learningPlanRepository.findByPublicId(
        learningPlanId,
        userId,
      );

      ownershipHelper.verifyOwnership(plan, userId, "Learning plan");

      // Find module and verify it belongs to plan
      const module = await learningModuleRepository.findByPublicId(
        learningModuleId,
        userId,
      );

      if (!module) {
        throw LearningPlanErrors.moduleNotFound();
      }

      // Get all tasks for the module
      const tasks = await learningTaskRepository.findByLearningModuleId(
        module.id,
      );

      log.info("Learning tasks listed successfully", {
        learningPlanId,
        learningModuleId,
        userId,
        count: tasks.length,
      });

      return tasks.map((task) => ({
        id: task.publicId,
        title: task.title,
        description: task.description,
        order: task.order,
        isCompleted: task.isCompleted,
        completedAt: task.completedAt?.toISOString() ?? null,
        dueDate: task.dueDate?.toISOString() ?? null,
        memo: task.memo,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }));
    } catch (error) {
      log.error("Learning tasks list failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        learningPlanId,
        learningModuleId,
        userId,
      });
      throw error;
    }
  }
}

/**
 * Singleton instance for convenience
 */
export const learningTaskQueryService = new LearningTaskQueryService();
