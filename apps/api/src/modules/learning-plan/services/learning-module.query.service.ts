import { log } from "../../../lib/logger";
import { ownershipHelper } from "../../../lib/authorization/ownership.helper";
import { learningPlanRepository } from "../repositories/learning-plan.repository";
import { learningModuleRepository } from "../repositories/learning-module.repository";
import { LearningPlanErrors } from "../errors";

/**
 * Input type for getting a learning module with tasks
 */
export interface GetLearningModuleInput {
  userId: string;
  learningPlanId: string; // publicId
  learningModuleId: string; // publicId
}

/**
 * Response type for learning module with tasks
 */
export interface LearningModuleWithTasksResponse {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isExpanded: boolean;
  createdAt: string;
  updatedAt: string;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    order: number;
    isCompleted: boolean;
    completedAt: string | null;
    dueDate: string | null;
    memo: string | null;
  }>;
}

/**
 * Query service for learning module operations
 * Handles read operations (queries)
 */
export class LearningModuleQueryService {
  /**
   * Gets a learning module with all its tasks
   */
  async getModuleWithTasks(
    input: GetLearningModuleInput,
  ): Promise<LearningModuleWithTasksResponse> {
    try {
      // Find and verify plan ownership
      const plan = await learningPlanRepository.findByPublicId(
        input.learningPlanId,
        input.userId,
      );

      ownershipHelper.verifyOwnership(plan, input.userId, "Learning plan");

      // Find module with tasks
      const moduleWithTasks = await learningModuleRepository.findWithTasks(
        input.learningModuleId,
      );

      if (!moduleWithTasks) {
        throw LearningPlanErrors.moduleNotFound();
      }

      // Verify module belongs to plan
      if (moduleWithTasks.learningPlanId !== plan!.id) {
        throw LearningPlanErrors.moduleNotFound();
      }

      log.info("Learning module with tasks retrieved successfully", {
        moduleId: input.learningModuleId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
      });

      return {
        id: moduleWithTasks.publicId,
        title: moduleWithTasks.title,
        description: moduleWithTasks.description,
        order: moduleWithTasks.order,
        isExpanded: moduleWithTasks.isExpanded,
        createdAt: moduleWithTasks.createdAt.toISOString(),
        updatedAt: moduleWithTasks.updatedAt.toISOString(),
        tasks: moduleWithTasks.tasks.map((task) => ({
          id: task.publicId,
          title: task.title,
          description: task.description,
          order: task.order,
          isCompleted: task.isCompleted,
          completedAt: task.completedAt?.toISOString() ?? null,
          dueDate: task.dueDate?.toISOString() ?? null,
          memo: task.memo,
        })),
      };
    } catch (error) {
      log.error("Learning module retrieval failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        moduleId: input.learningModuleId,
        userId: input.userId,
      });
      throw error;
    }
  }

  /**
   * Lists all modules belonging to a learning plan
   */
  async listModulesByPlan(
    learningPlanId: string,
    userId: string,
  ): Promise<
    Array<{
      id: string;
      title: string;
      description: string | null;
      order: number;
      isExpanded: boolean;
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

      // Get all modules for the plan
      const modules = await learningModuleRepository.findByLearningPlanId(
        plan!.id,
      );

      log.info("Learning modules listed successfully", {
        learningPlanId,
        userId,
        count: modules.length,
      });

      return modules.map((module) => ({
        id: module.publicId,
        title: module.title,
        description: module.description,
        order: module.order,
        isExpanded: module.isExpanded,
        createdAt: module.createdAt.toISOString(),
        updatedAt: module.updatedAt.toISOString(),
      }));
    } catch (error) {
      log.error("Learning modules list failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        learningPlanId,
        userId,
      });
      throw error;
    }
  }
}

/**
 * Singleton instance for convenience
 */
export const learningModuleQueryService = new LearningModuleQueryService();
