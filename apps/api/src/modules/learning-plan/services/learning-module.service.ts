import { learningModule, learningPlan } from "@repo/database/schema";
import { and, count, eq, gt, gte, lte, max, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "../../../database/client";
import { BaseError } from "../../../errors/base.error";
import { ErrorCodes } from "../../../errors/error-codes";
import { log } from "../../../lib/logger";
import { LearningPlanError, LearningPlanErrors } from "../errors";

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
 * Service layer for learning module operations.
 * Handles business logic and data access for learning modules.
 */
export class LearningModuleService {
  /**
   * Creates a new learning module
   * @param input - Learning module creation data
   * @returns Created learning module with formatted dates
   */
  async createModule(input: CreateLearningModuleInput) {
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

      // Get the next order value for this learningPlan
      const [maxOrderResult] = await db
        .select({
          maxOrder: max(learningModule.order),
        })
        .from(learningModule)
        .where(eq(learningModule.learningPlanId, learningPlanResult.id));

      const nextOrder = (maxOrderResult?.maxOrder || 0) + 1;

      // Generate unique public ID
      const publicId = nanoid();

      // Create learningModule in database
      const [createdLearningModule] = await db
        .insert(learningModule)
        .values({
          publicId,
          learningPlanId: learningPlanResult.id,
          title: input.title,
          description: input.description || null,
          order: nextOrder,
          isExpanded: input.isExpanded ?? true,
        })
        .returning({
          id: learningModule.id,
          publicId: learningModule.publicId,
          title: learningModule.title,
          description: learningModule.description,
          order: learningModule.order,
          isExpanded: learningModule.isExpanded,
          createdAt: learningModule.createdAt,
          updatedAt: learningModule.updatedAt,
        });

      if (!createdLearningModule) {
        throw LearningPlanErrors.moduleCreationFailed();
      }

      log.info("Learning module created successfully", {
        publicId: createdLearningModule.publicId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
      });

      // Format response
      return {
        id: createdLearningModule.publicId,
        title: createdLearningModule.title,
        description: createdLearningModule.description,
        order: createdLearningModule.order,
        isExpanded: createdLearningModule.isExpanded,
        createdAt: createdLearningModule.createdAt.toISOString(),
        updatedAt: createdLearningModule.updatedAt.toISOString(),
        aiNoteStatus: "idle" as const,
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
          "Invalid learning module data provided",
        );
      }

      // Log and throw generic error for unexpected issues
      log.error("Learning module creation failed", error, {
        learningPlanId: input.learningPlanId,
        userId: input.userId,
        title: input.title,
      });
      throw LearningPlanErrors.moduleCreationFailed({
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Updates an existing learning module
   * @param input - Learning module update data
   * @returns Updated learning module with formatted dates
   */
  async updateModule(input: UpdateLearningModuleInput) {
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
        throw LearningPlanErrors.accessDenied();
      }

      // Prepare update data - only include fields that are provided
      const updateData: Partial<typeof learningModule.$inferInsert> = {};

      if (input.title !== undefined) {
        updateData.title = input.title;
      }

      if (input.description !== undefined) {
        updateData.description = input.description || null;
      }

      if (input.isExpanded !== undefined) {
        updateData.isExpanded = input.isExpanded;
      }

      // Add updated timestamp
      updateData.updatedAt = new Date();

      // If no fields to update, return error
      if (Object.keys(updateData).length === 1) {
        // Only updatedAt
        throw new BaseError(
          400,
          ErrorCodes.VALIDATION_INVALID_INPUT,
          "No valid fields provided for update",
        );
      }

      // Update learningModule in database
      const [updatedLearningModule] = await db
        .update(learningModule)
        .set(updateData)
        .where(eq(learningModule.id, learningModuleResult.id))
        .returning({
          id: learningModule.id,
          publicId: learningModule.publicId,
          title: learningModule.title,
          description: learningModule.description,
          order: learningModule.order,
          isExpanded: learningModule.isExpanded,
          createdAt: learningModule.createdAt,
          updatedAt: learningModule.updatedAt,
        });

      if (!updatedLearningModule) {
        throw LearningPlanErrors.updateFailed();
      }

      log.info("Learning module updated successfully", {
        publicId: input.learningModuleId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
      });

      // Format response
      return {
        id: updatedLearningModule.publicId,
        title: updatedLearningModule.title,
        description: updatedLearningModule.description,
        order: updatedLearningModule.order,
        isExpanded: updatedLearningModule.isExpanded,
        createdAt: updatedLearningModule.createdAt.toISOString(),
        updatedAt: updatedLearningModule.updatedAt.toISOString(),
        aiNoteStatus: "idle" as const,
        aiNoteMarkdown: null,
        aiNoteRequestedAt: null,
        aiNoteCompletedAt: null,
        aiNoteError: null,
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
          "Invalid learning module data provided",
        );
      }

      // Log and throw generic error for unexpected issues
      log.error("Learning module update failed", error, {
        learningModuleId: input.learningModuleId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
      });
      throw LearningPlanErrors.updateFailed();
    }
  }

  /**
   * Deletes a learning module and reorders remaining modules
   * @param input - Learning module deletion data
   * @returns Success message with deleted module ID
   */
  async deleteModule(input: DeleteLearningModuleInput) {
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
          publicId: learningModule.publicId,
          learningPlanId: learningModule.learningPlanId,
          order: learningModule.order,
        })
        .from(learningModule)
        .where(eq(learningModule.publicId, input.learningModuleId))
        .limit(1);

      if (!learningModuleResult) {
        throw LearningPlanErrors.moduleNotFound();
      }

      if (learningModuleResult.learningPlanId !== learningPlanResult.id) {
        throw LearningPlanErrors.accessDenied();
      }

      // Use transaction to delete learningModule and reorder remaining learningModules
      await db.transaction(async (tx) => {
        // Delete the learningModule (learningTasks will be deleted automatically due to cascade)
        await tx
          .delete(learningModule)
          .where(eq(learningModule.id, learningModuleResult.id));

        // Update order of learningModules that come after the deleted learningModule
        await tx
          .update(learningModule)
          .set({
            order: sql`${learningModule.order} - 1`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(learningModule.learningPlanId, learningPlanResult.id),
              gt(learningModule.order, learningModuleResult.order),
            ),
          );
      });

      log.info("Learning module deleted successfully", {
        publicId: input.learningModuleId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
      });

      // Return success response
      return {
        message: "Learning module deleted successfully",
        deletedId: learningModuleResult.publicId,
      };
    } catch (error) {
      // Re-throw LearningPlanError as is
      if (error instanceof LearningPlanError) {
        throw error;
      }

      // Log and throw generic error for unexpected issues
      log.error("Learning module deletion failed", error, {
        learningModuleId: input.learningModuleId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
      });
      throw LearningPlanErrors.deleteFailed();
    }
  }

  /**
   * Reorders a learning module to a new position
   * @param input - Learning module reorder data
   * @returns Updated learning module with new order
   */
  async reorderModule(input: ReorderLearningModuleInput) {
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
          publicId: learningModule.publicId,
          learningPlanId: learningModule.learningPlanId,
          order: learningModule.order,
        })
        .from(learningModule)
        .where(eq(learningModule.publicId, input.learningModuleId))
        .limit(1);

      if (!learningModuleResult) {
        throw LearningPlanErrors.moduleNotFound();
      }

      if (learningModuleResult.learningPlanId !== learningPlanResult.id) {
        throw LearningPlanErrors.accessDenied();
      }

      // Get total number of learningModules in this learningPlan
      const [totalLearningModulesResult] = await db
        .select({
          totalLearningModules: count(),
        })
        .from(learningModule)
        .where(eq(learningModule.learningPlanId, learningPlanResult.id));

      const totalLearningModules =
        totalLearningModulesResult?.totalLearningModules || 0;

      // Validate new order position
      if (input.newOrder < 1 || input.newOrder > totalLearningModules) {
        throw new BaseError(
          400,
          ErrorCodes.VALIDATION_OUT_OF_RANGE,
          `Order position must be between 1 and ${totalLearningModules}`,
        );
      }

      const currentOrder = learningModuleResult.order;

      // If the order is the same, no need to update
      if (currentOrder === input.newOrder) {
        log.info("Learning module order unchanged", {
          publicId: input.learningModuleId,
          learningPlanId: input.learningPlanId,
          userId: input.userId,
          order: currentOrder,
        });

        return {
          id: learningModuleResult.publicId,
          order: currentOrder,
          updatedAt: new Date().toISOString(),
        };
      }

      // Use transaction to reorder learningModules
      const result = await db.transaction(async (tx) => {
        if (currentOrder < input.newOrder) {
          // Moving down: decrease order of learningModules between current and new position
          await tx
            .update(learningModule)
            .set({
              order: sql`${learningModule.order} - 1`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(learningModule.learningPlanId, learningPlanResult.id),
                gte(learningModule.order, currentOrder + 1),
                lte(learningModule.order, input.newOrder),
              ),
            );
        } else {
          // Moving up: increase order of learningModules between new and current position
          await tx
            .update(learningModule)
            .set({
              order: sql`${learningModule.order} + 1`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(learningModule.learningPlanId, learningPlanResult.id),
                gte(learningModule.order, input.newOrder),
                lte(learningModule.order, currentOrder - 1),
              ),
            );
        }

        // Update the target learning module's order
        const updatedLearningModule = await tx
          .update(learningModule)
          .set({
            order: input.newOrder,
            updatedAt: new Date(),
          })
          .where(eq(learningModule.id, learningModuleResult.id))
          .returning({
            id: learningModule.id,
            publicId: learningModule.publicId,
            order: learningModule.order,
            updatedAt: learningModule.updatedAt,
          });

        return updatedLearningModule[0];
      });

      if (!result) {
        throw LearningPlanErrors.updateFailed();
      }

      log.info("Learning module reordered successfully", {
        publicId: input.learningModuleId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
        oldOrder: currentOrder,
        newOrder: input.newOrder,
      });

      // Return success response
      return {
        id: result.publicId,
        order: result.order,
        updatedAt: result.updatedAt.toISOString(),
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
          "Invalid order position provided",
        );
      }

      // Log and throw generic error for unexpected issues
      log.error("Learning module reorder failed", error, {
        learningModuleId: input.learningModuleId,
        learningPlanId: input.learningPlanId,
        userId: input.userId,
        newOrder: input.newOrder,
      });
      throw LearningPlanErrors.updateFailed();
    }
  }
}

// Export singleton instance
export const learningModuleService = new LearningModuleService();
