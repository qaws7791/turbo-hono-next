import { learningPlanDocument } from "@repo/database/schema";
import { eq } from "drizzle-orm";

import { db } from "../../../database/client";
import { ownershipHelper } from "../../../lib/authorization/ownership.helper";
import { log } from "../../../lib/logger";
import { cursorPaginationHelper } from "../../../lib/pagination/cursor-pagination.helper";
import { LearningPlanErrors } from "../errors";
import { learningPlanRepository } from "../repositories/learning-plan.repository";
import { calculateCompletionPercent } from "../utils/progress";

import type { LearningPlanWithStats } from "../repositories/learning-plan.repository";

/**
 * Input type for getting a learning plan
 */
export interface GetLearningPlanInput {
  publicId: string;
  userId: string;
}

/**
 * Input type for listing learning plans
 */
export interface ListLearningPlansInput {
  userId: string;
  cursor?: string;
  limit?: number;
  status?: "active" | "archived";
  search?: string;
  sort?: "created_at" | "updated_at" | "title";
  order?: "asc" | "desc";
}

/**
 * Response type for learning plan detail with nested data
 */
export interface LearningPlanDetailResponse {
  id: string;
  emoji: string;
  title: string;
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
  learningModules: Array<{
    id: string;
    title: string;
    description: string | null;
    order: number;
    isExpanded: boolean;
    createdAt: string;
    updatedAt: string;
    learningTasks: Array<{
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
    }>;
  }>;
  documents: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    storageUrl: string;
    learningPlanId: number | null;
    uploadedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

/**
 * Response type for learning plan list item
 */
export interface LearningPlanListItemResponse {
  id: string;
  emoji: string;
  title: string;
  description: string | null;
  status: "active" | "archived";
  learningModuleCompletionPercent: number;
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
 * Query service for learning plan operations
 * Handles read operations (queries, list, aggregations)
 */
export class LearningPlanQueryService {
  /**
   * Gets a learning plan with all modules and tasks
   */
  async getLearningPlan(
    input: GetLearningPlanInput,
  ): Promise<LearningPlanDetailResponse> {
    try {
      // Get learning plan with nested modules and tasks
      const planWithRelations =
        await learningPlanRepository.findWithModulesAndTasks(
          input.publicId,
          input.userId,
        );

      if (!planWithRelations) {
        throw LearningPlanErrors.notFound();
      }

      // Verify ownership
      ownershipHelper.verifyOwnership(
        planWithRelations,
        input.userId,
        "Learning plan",
      );

      // Get associated documents
      const documents = await db
        .select()
        .from(learningPlanDocument)
        .where(eq(learningPlanDocument.learningPlanId, planWithRelations.id))
        .then((docs) =>
          docs.map((doc) => ({
            id: doc.publicId,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            fileType: doc.fileType,
            storageUrl: doc.storageUrl,
            learningPlanId: doc.learningPlanId,
            uploadedAt: doc.uploadedAt,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
          })),
        );

      log.info("Learning plan retrieved successfully", {
        publicId: input.publicId,
        userId: input.userId,
      });

      // Format response with nested structure
      return {
        id: planWithRelations.publicId,
        emoji: planWithRelations.emoji,
        title: planWithRelations.title,
        description: planWithRelations.description,
        status: planWithRelations.status as "active" | "archived",
        learningTopic: planWithRelations.learningTopic,
        userLevel: planWithRelations.userLevel,
        targetWeeks: planWithRelations.targetWeeks,
        weeklyHours: planWithRelations.weeklyHours,
        learningStyle: planWithRelations.learningStyle,
        preferredResources: planWithRelations.preferredResources,
        mainGoal: planWithRelations.mainGoal,
        additionalRequirements: planWithRelations.additionalRequirements,
        createdAt: planWithRelations.createdAt.toISOString(),
        updatedAt: planWithRelations.updatedAt.toISOString(),
        learningModules: planWithRelations.modules.map((module) => ({
          id: module.publicId,
          title: module.title,
          description: module.description,
          order: module.order,
          isExpanded: module.isExpanded,
          createdAt: new Date().toISOString(), // Module doesn't have timestamps in the nested structure
          updatedAt: new Date().toISOString(),
          learningTasks: module.tasks.map((task) => ({
            id: task.publicId,
            title: task.title,
            description: task.description,
            isCompleted: task.isCompleted,
            completedAt: task.completedAt?.toISOString() ?? null,
            dueDate: task.dueDate?.toISOString() ?? null,
            memo: task.memo,
            order: task.order,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })),
        })),
        documents,
      };
    } catch (error) {
      log.error("Learning plan retrieval failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        publicId: input.publicId,
        userId: input.userId,
      });
      throw error;
    }
  }

  /**
   * Lists learning plans with pagination and filtering
   */
  async listLearningPlans(input: ListLearningPlansInput): Promise<{
    items: Array<LearningPlanListItemResponse>;
    pagination: { hasNext: boolean; nextCursor: string | null };
  }> {
    try {
      const {
        userId,
        cursor,
        limit = 10,
        status,
        search,
        sort = "created_at",
        order = "desc",
      } = input;

      // Decode cursor if provided
      let cursorData: { id: number; value: string | Date } | undefined;
      if (cursor) {
        try {
          cursorData = cursorPaginationHelper.decodeCursor(cursor);
        } catch {
          throw LearningPlanErrors.updateFailed({
            originalError: "Invalid pagination cursor",
          });
        }
      }

      // Query learning plans with progress statistics in a single query
      const plans = await learningPlanRepository.findAllWithStats({
        userId,
        status,
        search,
        sortBy: sort,
        order,
        limit: limit + 1, // Fetch one extra to check if there's a next page
        cursor: cursorData,
      });

      // Transform plans with completion percentage
      const plansWithProgress = plans.slice(0, limit).map((plan) => {
        const completionPercent = calculateCompletionPercent(
          plan.completedTasks,
          plan.totalTasks,
        );

        return {
          id: plan.publicId,
          emoji: plan.emoji,
          title: plan.title,
          description: plan.description,
          status: plan.status as "active" | "archived",
          learningModuleCompletionPercent: completionPercent,
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
      });

      // Create paginated result
      const getCursorValue = (item: LearningPlanWithStats): string | Date => {
        if (sort === "title") return item.title;
        if (sort === "updated_at") return item.updatedAt;
        return item.createdAt;
      };

      const result = cursorPaginationHelper.createResult(
        plans,
        limit,
        getCursorValue,
      );

      log.info("Learning plans listed successfully", {
        userId,
        count: plansWithProgress.length,
        hasNext: result.hasNext,
      });

      return {
        items: plansWithProgress,
        pagination: {
          hasNext: result.hasNext,
          nextCursor: result.nextCursor,
        },
      };
    } catch (error) {
      log.error("Learning plans list failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: input.userId,
      });
      throw error;
    }
  }
}

/**
 * Singleton instance for convenience
 */
export const learningPlanQueryService = new LearningPlanQueryService();
