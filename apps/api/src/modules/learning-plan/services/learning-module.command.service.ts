import { nanoid } from "nanoid";

import { ownershipHelper } from "../../../lib/authorization/ownership.helper";
import { log } from "../../../lib/logger";
import { runInTransaction } from "../../../lib/transaction.helper";
import { LearningPlanErrors } from "../errors";
import { learningModuleRepository } from "../repositories/learning-module.repository";
import { learningPlanRepository } from "../repositories/learning-plan.repository";

import type { LearningModule } from "@repo/database/types";

/**
 * Input type for creating a learning module
 */
export interface CreateLearningModuleInput {
  userId: string;
  learningPlanId: string; // publicId
  title: string;
  description?: string | null;
  isExpanded?: boolean;
}

/**
 * Input type for updating a learning module
 */
export interface UpdateLearningModuleInput {
  userId: string;
  learningPlanId: string; // publicId
  learningModuleId: string; // publicId
  title?: string;
  description?: string | null;
  isExpanded?: boolean;
}

/**
 * Input type for deleting a learning module
 */
export interface DeleteLearningModuleInput {
  userId: string;
  learningPlanId: string; // publicId
  learningModuleId: string; // publicId
}

/**
 * Input type for reordering a learning module
 */
export interface ReorderLearningModuleInput {
  userId: string;
  learningPlanId: string; // publicId
  learningModuleId: string; // publicId
  newOrder: number;
}

/**
 * Response type for learning module operations
 */
export interface LearningModuleResponse {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isExpanded: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Command service for learning module operations
 * Handles create, update, delete, reorder operations
 */
export class LearningModuleCommandService {
  /**
   * Creates a new learning module
   */
  async createModule(
    input: CreateLearningModuleInput,
  ): Promise<LearningModuleResponse> {
    try {
      return await runInTransaction(async (tx) => {
        // Find and verify plan ownership
        const plan = await learningPlanRepository.findByPublicId(
          input.learningPlanId,
          input.userId,
          tx,
        );

        ownershipHelper.verifyOwnership(plan, input.userId, "Learning plan");

        // Get next order value
        const nextOrder =
          (await learningModuleRepository.getMaxOrder(plan!.id, tx)) + 1;

        // Generate unique public ID
        const publicId = nanoid();

        // Create module
        const createdModule = await learningModuleRepository.create(
          {
            publicId,
            learningPlanId: plan!.id,
            title: input.title,
            description: input.description || null,
            order: nextOrder,
            isExpanded: input.isExpanded ?? true,
          },
          tx,
        );

        log.info("Learning module created successfully", {
          publicId: createdModule.publicId,
          learningPlanId: input.learningPlanId,
          userId: input.userId,
        });

        return this.formatModuleResponse(createdModule);
      });
    } catch (error) {
      log.error("Learning module creation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: input.userId,
      });
      throw LearningPlanErrors.moduleCreationFailed();
    }
  }

  /**
   * Updates an existing learning module
   */
  async updateModule(
    input: UpdateLearningModuleInput,
  ): Promise<LearningModuleResponse> {
    try {
      return await runInTransaction(async (tx) => {
        // Find and verify plan ownership
        const plan = await learningPlanRepository.findByPublicId(
          input.learningPlanId,
          input.userId,
          tx,
        );

        ownershipHelper.verifyOwnership(plan, input.userId, "Learning plan");

        // Find module
        const existingModule = await learningModuleRepository.findByPublicId(
          input.learningModuleId,
          input.userId,
          tx,
        );

        if (!existingModule) {
          throw LearningPlanErrors.moduleNotFound();
        }

        // Verify module belongs to plan
        if (existingModule.learningPlanId !== plan!.id) {
          throw LearningPlanErrors.moduleNotFound();
        }

        // Prepare update data
        const updateData: Partial<LearningModule> = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.description !== undefined)
          updateData.description = input.description;
        if (input.isExpanded !== undefined)
          updateData.isExpanded = input.isExpanded;

        // Update module
        const updatedModule = await learningModuleRepository.update(
          existingModule.id,
          updateData,
          tx,
        );

        log.info("Learning module updated successfully", {
          publicId: input.learningModuleId,
          learningPlanId: input.learningPlanId,
          userId: input.userId,
        });

        return this.formatModuleResponse(updatedModule);
      });
    } catch (error) {
      log.error("Learning module update failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: input.userId,
      });
      throw LearningPlanErrors.moduleCreationFailed();
    }
  }

  /**
   * Deletes a learning module
   */
  async deleteModule(
    input: DeleteLearningModuleInput,
  ): Promise<{ deletedId: string; message: string }> {
    try {
      return await runInTransaction(async (tx) => {
        // Find and verify plan ownership
        const plan = await learningPlanRepository.findByPublicId(
          input.learningPlanId,
          input.userId,
          tx,
        );

        ownershipHelper.verifyOwnership(plan, input.userId, "Learning plan");

        // Find module
        const existingModule = await learningModuleRepository.findByPublicId(
          input.learningModuleId,
          input.userId,
          tx,
        );

        if (!existingModule) {
          throw LearningPlanErrors.moduleNotFound();
        }

        // Verify module belongs to plan
        if (existingModule.learningPlanId !== plan!.id) {
          throw LearningPlanErrors.moduleNotFound();
        }

        // Delete module (CASCADE will handle tasks)
        await learningModuleRepository.delete(existingModule.id, tx);

        // Adjust order of remaining modules
        await learningModuleRepository.decrementOrdersFrom(
          plan!.id,
          existingModule.order + 1,
          tx,
        );

        log.info("Learning module deleted successfully", {
          publicId: input.learningModuleId,
          learningPlanId: input.learningPlanId,
          userId: input.userId,
        });

        return {
          deletedId: input.learningModuleId,
          message: "Learning module deleted successfully",
        };
      });
    } catch (error) {
      log.error("Learning module deletion failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: input.userId,
      });
      throw LearningPlanErrors.moduleCreationFailed();
    }
  }

  /**
   * Reorders a learning module
   */
  async reorderModule(
    input: ReorderLearningModuleInput,
  ): Promise<LearningModuleResponse> {
    try {
      return await runInTransaction(async (tx) => {
        // Find and verify plan ownership
        const plan = await learningPlanRepository.findByPublicId(
          input.learningPlanId,
          input.userId,
          tx,
        );

        ownershipHelper.verifyOwnership(plan, input.userId, "Learning plan");

        // Find module
        const existingModule = await learningModuleRepository.findByPublicId(
          input.learningModuleId,
          input.userId,
          tx,
        );

        if (!existingModule) {
          throw LearningPlanErrors.moduleNotFound();
        }

        // Verify module belongs to plan
        if (existingModule.learningPlanId !== plan!.id) {
          throw LearningPlanErrors.moduleNotFound();
        }

        const currentOrder = existingModule.order;
        const targetOrder = input.newOrder;

        // No change needed
        if (currentOrder === targetOrder) {
          return this.formatModuleResponse(existingModule);
        }

        // Reorder logic
        if (currentOrder < targetOrder) {
          // Moving down: decrement orders between current and target
          await learningModuleRepository.decrementOrdersFrom(
            plan!.id,
            currentOrder + 1,
            tx,
          );
        } else {
          // Moving up: increment orders between target and current
          await learningModuleRepository.incrementOrdersFrom(
            plan!.id,
            targetOrder,
            tx,
          );
        }

        // Update module's order
        const updatedModule = await learningModuleRepository.update(
          existingModule.id,
          { order: targetOrder },
          tx,
        );

        log.info("Learning module reordered successfully", {
          publicId: input.learningModuleId,
          learningPlanId: input.learningPlanId,
          oldOrder: currentOrder,
          newOrder: targetOrder,
          userId: input.userId,
        });

        return this.formatModuleResponse(updatedModule);
      });
    } catch (error) {
      log.error("Learning module reorder failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: input.userId,
      });
      throw LearningPlanErrors.moduleReorderFailed();
    }
  }

  /**
   * Format learning module entity to response DTO
   * @private
   */
  private formatModuleResponse(module: LearningModule): LearningModuleResponse {
    return {
      id: module.publicId,
      title: module.title,
      description: module.description,
      order: module.order,
      isExpanded: module.isExpanded,
      createdAt: module.createdAt.toISOString(),
      updatedAt: module.updatedAt.toISOString(),
    };
  }
}

/**
 * Singleton instance for convenience
 */
export const learningModuleCommandService = new LearningModuleCommandService();
