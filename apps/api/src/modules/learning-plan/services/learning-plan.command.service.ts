import { nanoid } from "nanoid";

import { log } from "../../../lib/logger";
import { runInTransaction } from "../../../lib/transaction.helper";
import { ownershipHelper } from "../../../lib/authorization/ownership.helper";
import { learningPlanRepository } from "../repositories/learning-plan.repository";
import { LearningPlanEmoji } from "../utils/emoji";
import { LearningPlanErrors } from "../errors";

import type { LearningPlan } from "@repo/database/types";

/**
 * Input type for creating a learning plan
 */
export interface CreateLearningPlanInput {
  userId: string;
  title: string;
  emoji?: string;
  description?: string;
  learningTopic: string;
  userLevel: string;
  targetWeeks: number;
  weeklyHours: number;
  learningStyle: string;
  preferredResources: string;
  mainGoal: string;
  additionalRequirements?: string | null;
}

/**
 * Input type for updating a learning plan
 */
export interface UpdateLearningPlanInput {
  publicId: string;
  userId: string;
  updateData: Partial<{
    title: string;
    description: string;
    emoji: string;
    learningTopic: string;
    userLevel: string;
    targetWeeks: number;
    weeklyHours: number;
    learningStyle: string;
    preferredResources: string;
    mainGoal: string;
    additionalRequirements: string | null;
  }>;
}

/**
 * Input type for deleting a learning plan
 */
export interface DeleteLearningPlanInput {
  publicId: string;
  userId: string;
}

/**
 * Input type for updating learning plan status
 */
export interface UpdateLearningPlanStatusInput {
  publicId: string;
  userId: string;
  status: "active" | "archived";
}

/**
 * Response type for learning plan operations
 */
export interface LearningPlanResponse {
  id: string;
  title: string;
  emoji: string;
  description: string | null;
  status: "active" | "archived";
  learningTopic: string;
  userLevel: string;
  targetWeeks: number;
  weeklyHours: number;
  learningStyle: string;
  preferredResources: string;
  mainGoal: string;
  additionalRequirements: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Command service for learning plan operations
 * Handles create, update, delete operations (write operations)
 */
export class LearningPlanCommandService {
  /**
   * Creates a new learning plan
   */
  async createLearningPlan(
    input: CreateLearningPlanInput,
  ): Promise<LearningPlanResponse> {
    try {
      // Generate unique public ID
      const publicId = nanoid(16);
      const resolvedEmoji = LearningPlanEmoji.ensure(
        input.emoji,
        input.learningTopic,
      );

      // Create learning plan in database
      const createdPlan = await learningPlanRepository.create({
        publicId,
        userId: input.userId,
        title: input.title,
        description: input.description || null,
        status: "active",
        emoji: resolvedEmoji,
        learningTopic: input.learningTopic,
        userLevel: input.userLevel,
        targetWeeks: input.targetWeeks,
        weeklyHours: input.weeklyHours,
        learningStyle: input.learningStyle,
        preferredResources: input.preferredResources,
        mainGoal: input.mainGoal,
        additionalRequirements: input.additionalRequirements || null,
      });

      log.info("Learning plan created successfully", {
        publicId: createdPlan.publicId,
        userId: input.userId,
      });

      return this.formatPlanResponse(createdPlan);
    } catch (error) {
      log.error("Learning plan creation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: input.userId,
        title: input.title,
      });
      throw LearningPlanErrors.creationFailed({
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Updates an existing learning plan
   */
  async updateLearningPlan(
    input: UpdateLearningPlanInput,
  ): Promise<LearningPlanResponse> {
    try {
      // Validate that at least one field is provided
      if (Object.keys(input.updateData).length === 0) {
        throw LearningPlanErrors.updateFailed({
          originalError: "At least one field must be provided for update",
        });
      }

      // Find and verify ownership
      const existingPlan = await learningPlanRepository.findByPublicId(
        input.publicId,
        input.userId,
      );

      ownershipHelper.verifyOwnership(
        existingPlan,
        input.userId,
        "Learning plan",
      );

      // Prepare update data
      const { emoji: requestedEmoji, ...restUpdate } = input.updateData;
      const updatePayload: Partial<LearningPlan> = { ...restUpdate };

      // Handle emoji update
      if (requestedEmoji !== undefined && existingPlan) {
        updatePayload.emoji = LearningPlanEmoji.ensure(
          requestedEmoji,
          (restUpdate.learningTopic as string | undefined) ??
            existingPlan.learningTopic,
        );
      }

      // Update learning plan
      const updatedPlan = await learningPlanRepository.update(
        existingPlan!.id,
        updatePayload,
      );

      log.info("Learning plan updated successfully", {
        publicId: input.publicId,
        userId: input.userId,
      });

      return this.formatPlanResponse(updatedPlan);
    } catch (error) {
      log.error("Learning plan update failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        publicId: input.publicId,
        userId: input.userId,
      });
      throw LearningPlanErrors.updateFailed();
    }
  }

  /**
   * Deletes a learning plan
   * Uses transaction to ensure data consistency
   */
  async deleteLearningPlan(
    input: DeleteLearningPlanInput,
  ): Promise<{ deletedId: string; message: string }> {
    try {
      return await runInTransaction(async (tx) => {
        // Find and verify ownership
        const existingPlan = await learningPlanRepository.findByPublicId(
          input.publicId,
          input.userId,
          tx,
        );

        ownershipHelper.verifyOwnership(
          existingPlan,
          input.userId,
          "Learning plan",
        );

        // Delete learning plan (CASCADE will handle modules and tasks)
        await learningPlanRepository.delete(existingPlan!.id, tx);

        log.info("Learning plan deleted successfully", {
          publicId: input.publicId,
          userId: input.userId,
        });

        return {
          deletedId: input.publicId,
          message: "Learning plan deleted successfully",
        };
      });
    } catch (error) {
      log.error("Learning plan deletion failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        publicId: input.publicId,
        userId: input.userId,
      });
      throw LearningPlanErrors.deleteFailed();
    }
  }

  /**
   * Updates the status of a learning plan (archive/activate)
   */
  async updateLearningPlanStatus(
    input: UpdateLearningPlanStatusInput,
  ): Promise<LearningPlanResponse> {
    try {
      // Find and verify ownership
      const existingPlan = await learningPlanRepository.findByPublicId(
        input.publicId,
        input.userId,
      );

      ownershipHelper.verifyOwnership(
        existingPlan,
        input.userId,
        "Learning plan",
      );

      // Update status
      const updatedPlan = await learningPlanRepository.update(
        existingPlan!.id,
        { status: input.status },
      );

      log.info("Learning plan status updated successfully", {
        publicId: input.publicId,
        userId: input.userId,
        status: input.status,
      });

      return this.formatPlanResponse(updatedPlan);
    } catch (error) {
      log.error("Learning plan status update failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        publicId: input.publicId,
        userId: input.userId,
      });
      throw LearningPlanErrors.updateFailed();
    }
  }

  /**
   * Format learning plan entity to response DTO
   * @private
   */
  private formatPlanResponse(plan: LearningPlan): LearningPlanResponse {
    return {
      id: plan.publicId,
      title: plan.title,
      emoji: plan.emoji,
      description: plan.description,
      status: plan.status as "active" | "archived",
      learningTopic: plan.learningTopic,
      userLevel: plan.userLevel,
      targetWeeks: plan.targetWeeks,
      weeklyHours: plan.weeklyHours,
      learningStyle: plan.learningStyle,
      preferredResources: plan.preferredResources,
      mainGoal: plan.mainGoal,
      additionalRequirements: plan.additionalRequirements,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }
}

/**
 * Singleton instance for convenience
 */
export const learningPlanCommandService = new LearningPlanCommandService();
