import { nanoid } from "nanoid";
import {
  aiNote,
  learningModule,
  learningPlan,
  learningPlanDocument,
  learningTask,
} from "@repo/database/schema";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  ilike,
  inArray,
  lt,
  or,
  sql,
} from "drizzle-orm";

import { db } from "../../../database/client";
import { LearningPlanEmoji } from "../utils/emoji";
import { LearningPlanError, LearningPlanErrors } from "../errors";
import { ErrorCodes } from "../../../errors/error-codes";
import { log } from "../../../lib/logger";
import { BaseError } from "../../../errors/base.error";
import { LEARNING_TASK_NOTE_STATUS } from "../../ai/services/learning-task-note-service";
import { calculateCompletionPercent } from "../utils/progress";

import type { LearningTaskNoteStatus } from "../../ai/services/learning-task-note-service";

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
 * Input type for updating learning plan status
 */
export interface UpdateLearningPlanStatusInput {
  publicId: string;
  userId: string;
  status: "active" | "archived";
}

// Cursor encoding/decoding utilities
type SortValue = string | Date;

interface CursorData {
  id: number;
  [key: string]: SortValue | number;
}

function encodeCursor(
  id: number,
  sortField: string,
  sortValue: SortValue,
): string {
  const cursorData = { id, [sortField]: sortValue };
  return Buffer.from(JSON.stringify(cursorData)).toString("base64");
}

function decodeCursor(cursor: string): CursorData | null {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    return JSON.parse(decoded) as CursorData;
  } catch {
    return null;
  }
}

/**
 * Service layer for learning plan operations.
 * Handles business logic and data access for learning plans.
 */
export class LearningPlanService {
  /**
   * Creates a new learning plan
   * @param input - Learning plan creation data
   * @returns Created learning plan with formatted dates
   */
  async createLearningPlan(input: CreateLearningPlanInput) {
    try {
      // Generate unique public ID
      const publicId = nanoid(16);
      const resolvedEmoji = LearningPlanEmoji.ensure(
        input.emoji,
        input.learningTopic,
      );

      // Create learningPlan in database
      const [createdLearningPlan] = await db
        .insert(learningPlan)
        .values({
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
        })
        .returning({
          id: learningPlan.id,
          publicId: learningPlan.publicId,
          title: learningPlan.title,
          description: learningPlan.description,
          status: learningPlan.status,
          emoji: learningPlan.emoji,
          learningTopic: learningPlan.learningTopic,
          userLevel: learningPlan.userLevel,
          targetWeeks: learningPlan.targetWeeks,
          weeklyHours: learningPlan.weeklyHours,
          learningStyle: learningPlan.learningStyle,
          preferredResources: learningPlan.preferredResources,
          mainGoal: learningPlan.mainGoal,
          additionalRequirements: learningPlan.additionalRequirements,
          createdAt: learningPlan.createdAt,
          updatedAt: learningPlan.updatedAt,
        });

      if (!createdLearningPlan) {
        throw LearningPlanErrors.creationFailed();
      }

      // Format response with ISO dates
      return {
        id: createdLearningPlan.publicId,
        title: createdLearningPlan.title,
        emoji: createdLearningPlan.emoji,
        description: createdLearningPlan.description,
        status: createdLearningPlan.status as "active" | "archived",
        learningTopic: createdLearningPlan.learningTopic,
        userLevel: createdLearningPlan.userLevel,
        targetWeeks: createdLearningPlan.targetWeeks,
        weeklyHours: createdLearningPlan.weeklyHours,
        learningStyle: createdLearningPlan.learningStyle,
        preferredResources: createdLearningPlan.preferredResources,
        mainGoal: createdLearningPlan.mainGoal,
        additionalRequirements: createdLearningPlan.additionalRequirements,
        createdAt: createdLearningPlan.createdAt.toISOString(),
        updatedAt: createdLearningPlan.updatedAt.toISOString(),
      };
    } catch (error) {
      // Re-throw LearningPlanError as is
      if (error instanceof LearningPlanError) {
        throw error;
      }

      // Handle validation errors
      if (error instanceof Error && error.message.includes("validation")) {
        throw new LearningPlanError(
          400,
          ErrorCodes.VALIDATION_INVALID_INPUT,
          "Invalid learningPlan data provided",
        );
      }

      // Log and throw generic error for unexpected issues
      log.error("Learning plan creation failed", error, {
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
   * @param input - Learning plan update data
   * @returns Updated learning plan with formatted dates
   */
  async updateLearningPlan(input: UpdateLearningPlanInput) {
    try {
      // Validate that at least one field is provided
      if (Object.keys(input.updateData).length === 0) {
        throw new BaseError(
          400,
          ErrorCodes.VALIDATION_INVALID_INPUT,
          "At least one field must be provided for update",
        );
      }

      // Check if learningPlan exists and user has access
      const existingLearningPlans = await db
        .select({
          id: learningPlan.id,
          userId: learningPlan.userId,
          publicId: learningPlan.publicId,
          learningTopic: learningPlan.learningTopic,
          emoji: learningPlan.emoji,
        })
        .from(learningPlan)
        .where(eq(learningPlan.publicId, input.publicId))
        .limit(1);

      const [existingLearningPlan] = existingLearningPlans;

      if (!existingLearningPlan) {
        throw LearningPlanErrors.notFound();
      }

      if (existingLearningPlan.userId !== input.userId) {
        throw LearningPlanErrors.accessDenied();
      }

      // Perform the update
      const { emoji: requestedEmoji, ...restUpdate } = input.updateData;

      const updatePayload: Partial<typeof learningPlan.$inferInsert> = {
        ...restUpdate,
        updatedAt: new Date(),
      };

      if (requestedEmoji !== undefined) {
        updatePayload.emoji = LearningPlanEmoji.ensure(
          requestedEmoji,
          (restUpdate.learningTopic as string | undefined) ??
            existingLearningPlan.learningTopic,
        );
      }

      const [updatedLearningPlan] = await db
        .update(learningPlan)
        .set(updatePayload)
        .where(eq(learningPlan.publicId, input.publicId))
        .returning({
          id: learningPlan.id,
          publicId: learningPlan.publicId,
          title: learningPlan.title,
          description: learningPlan.description,
          status: learningPlan.status,
          emoji: learningPlan.emoji,
          learningTopic: learningPlan.learningTopic,
          userLevel: learningPlan.userLevel,
          targetWeeks: learningPlan.targetWeeks,
          weeklyHours: learningPlan.weeklyHours,
          learningStyle: learningPlan.learningStyle,
          preferredResources: learningPlan.preferredResources,
          mainGoal: learningPlan.mainGoal,
          additionalRequirements: learningPlan.additionalRequirements,
          createdAt: learningPlan.createdAt,
          updatedAt: learningPlan.updatedAt,
        });

      if (!updatedLearningPlan) {
        throw LearningPlanErrors.updateFailed();
      }

      log.info("Learning plan updated successfully", {
        publicId: input.publicId,
        userId: input.userId,
      });

      // Format response
      return {
        id: updatedLearningPlan.publicId,
        title: updatedLearningPlan.title,
        emoji: updatedLearningPlan.emoji,
        description: updatedLearningPlan.description,
        status: updatedLearningPlan.status as "active" | "archived",
        learningTopic: updatedLearningPlan.learningTopic,
        userLevel: updatedLearningPlan.userLevel,
        targetWeeks: updatedLearningPlan.targetWeeks,
        weeklyHours: updatedLearningPlan.weeklyHours,
        learningStyle: updatedLearningPlan.learningStyle,
        preferredResources: updatedLearningPlan.preferredResources,
        mainGoal: updatedLearningPlan.mainGoal,
        additionalRequirements: updatedLearningPlan.additionalRequirements,
        createdAt: updatedLearningPlan.createdAt.toISOString(),
        updatedAt: updatedLearningPlan.updatedAt.toISOString(),
      };
    } catch (error) {
      // Re-throw LearningPlanError or BaseError as is
      if (error instanceof LearningPlanError || error instanceof BaseError) {
        throw error;
      }

      // Log and throw generic error for unexpected issues
      log.error("Learning plan update failed", error, {
        publicId: input.publicId,
        userId: input.userId,
      });
      throw LearningPlanErrors.updateFailed();
    }
  }

  /**
   * Deletes a learning plan
   * @param input - Learning plan deletion data
   * @returns Success message with deleted plan ID
   */
  async deleteLearningPlan(input: DeleteLearningPlanInput) {
    try {
      // Check if learningPlan exists and user has access
      const existingLearningPlans = await db
        .select({
          id: learningPlan.id,
          userId: learningPlan.userId,
          publicId: learningPlan.publicId,
          status: learningPlan.status,
        })
        .from(learningPlan)
        .where(eq(learningPlan.publicId, input.publicId))
        .limit(1);

      const [existingLearningPlan] = existingLearningPlans;

      if (!existingLearningPlan) {
        throw LearningPlanErrors.notFound();
      }

      if (existingLearningPlan.userId !== input.userId) {
        throw LearningPlanErrors.accessDenied();
      }

      // Perform the deletion (CASCADE will handle learningModules and learningTasks)
      const deletedLearningPlans = await db
        .delete(learningPlan)
        .where(eq(learningPlan.publicId, input.publicId))
        .returning({
          publicId: learningPlan.publicId,
        });

      if (deletedLearningPlans.length === 0) {
        throw LearningPlanErrors.deleteFailed();
      }

      log.info("Learning plan deleted successfully", {
        publicId: input.publicId,
        userId: input.userId,
      });

      return {
        message: "Learning plan deleted successfully",
        deletedId: input.publicId,
      };
    } catch (error) {
      // Re-throw LearningPlanError as is
      if (error instanceof LearningPlanError) {
        throw error;
      }

      // Log and throw generic error for unexpected issues
      log.error("Learning plan deletion failed", error, {
        publicId: input.publicId,
        userId: input.userId,
      });
      throw LearningPlanErrors.deleteFailed();
    }
  }

  /**
   * Gets a learning plan with all modules and tasks
   * @param input - Learning plan query data
   * @returns Fully populated learning plan with nested structure
   */
  async getLearningPlan(input: GetLearningPlanInput) {
    try {
      // Get learningPlan by public ID and verify ownership
      const learningPlanResult = await db
        .select()
        .from(learningPlan)
        .where(eq(learningPlan.publicId, input.publicId))
        .limit(1);

      const learningPlanData = learningPlanResult[0];
      if (!learningPlanData) {
        throw LearningPlanErrors.notFound();
      }

      // Check if user owns the learningPlan
      if (learningPlanData.userId !== input.userId) {
        throw LearningPlanErrors.accessDenied();
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

      log.info("Learning plan retrieved successfully", {
        publicId: input.publicId,
        userId: input.userId,
      });

      // Format response
      return {
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
    } catch (error) {
      // Re-throw LearningPlanError as is
      if (error instanceof LearningPlanError) {
        throw error;
      }

      // Log and throw generic error for unexpected issues
      log.error("Learning plan retrieval failed", error, {
        publicId: input.publicId,
        userId: input.userId,
      });
      throw LearningPlanErrors.updateFailed();
    }
  }

  /**
   * Lists learning plans with pagination and filtering
   * @param input - List query parameters
   * @returns Paginated list of learning plans with cursor
   */
  async listLearningPlans(input: ListLearningPlansInput) {
    try {
      const {
        userId,
        cursor,
        limit = 10,
        status: statusFilter,
        search,
        sort = "created_at",
        order = "desc",
      } = input;

      // Decode cursor if provided
      let cursorData: CursorData | null = null;
      if (cursor) {
        cursorData = decodeCursor(cursor);
        if (!cursorData) {
          throw new BaseError(
            400,
            ErrorCodes.VALIDATION_INVALID_PAGINATION,
            "Invalid pagination cursor",
          );
        }
      }

      // Build where conditions
      const conditions = [eq(learningPlan.userId, userId)];

      // Status filter
      if (statusFilter) {
        conditions.push(eq(learningPlan.status, statusFilter));
      }

      // Search filter
      if (search) {
        conditions.push(
          or(
            ilike(learningPlan.title, `%${search}%`),
            ilike(learningPlan.description, `%${search}%`),
            ilike(learningPlan.learningTopic, `%${search}%`),
          )!,
        );
      }

      // Cursor-based pagination conditions
      if (cursorData) {
        const sortColumn =
          sort === "title"
            ? learningPlan.title
            : sort === "updated_at"
              ? learningPlan.updatedAt
              : learningPlan.createdAt;

        const cursorValue = cursorData[sort] as string | Date;

        if (order === "desc") {
          // For descending order: next page has values less than cursor
          conditions.push(
            or(
              lt(sortColumn, cursorValue),
              and(
                eq(sortColumn, cursorValue),
                gt(learningPlan.id, cursorData.id),
              ),
            )!,
          );
        } else {
          // For ascending order: next page has values greater than cursor
          conditions.push(
            or(
              gt(sortColumn, cursorValue),
              and(
                eq(sortColumn, cursorValue),
                gt(learningPlan.id, cursorData.id),
              ),
            )!,
          );
        }
      }

      // Build order by
      const sortColumn =
        sort === "title"
          ? learningPlan.title
          : sort === "updated_at"
            ? learningPlan.updatedAt
            : learningPlan.createdAt;

      const orderBy =
        order === "desc"
          ? [desc(sortColumn), asc(learningPlan.id)]
          : [asc(sortColumn), asc(learningPlan.id)];

      // Execute query with limit + 1 to check if there are more items
      const results = await db
        .select({
          id: learningPlan.id,
          publicId: learningPlan.publicId,
          emoji: learningPlan.emoji,
          title: learningPlan.title,
          description: learningPlan.description,
          status: learningPlan.status,
          learningTopic: learningPlan.learningTopic,
          userLevel: learningPlan.userLevel,
          targetWeeks: learningPlan.targetWeeks,
          weeklyHours: learningPlan.weeklyHours,
          learningStyle: learningPlan.learningStyle,
          preferredResources: learningPlan.preferredResources,
          mainGoal: learningPlan.mainGoal,
          additionalRequirements: learningPlan.additionalRequirements,
          createdAt: learningPlan.createdAt,
          updatedAt: learningPlan.updatedAt,
        })
        .from(learningPlan)
        .where(and(...conditions))
        .orderBy(...orderBy)
        .limit(limit + 1);

      // Check if there are more items
      const hasNext = results.length > limit;
      const items = hasNext ? results.slice(0, limit) : results;

      // Aggregate learningModule completion progress for the current page
      const learningPlanIds = items.map((item) => item.id);
      const progressByLearningPlanId = new Map<
        number,
        { total: number; completed: number }
      >();

      if (learningPlanIds.length > 0) {
        const progressRows = await db
          .select({
            learningPlanId: learningPlan.id,
            totalLearningTasks: sql<number>`count(${learningTask.id})`,
            completedLearningTasks: sql<number>`count(case when ${learningTask.isCompleted} then 1 end)`,
          })
          .from(learningPlan)
          .leftJoin(
            learningModule,
            eq(learningModule.learningPlanId, learningPlan.id),
          )
          .leftJoin(
            learningTask,
            eq(learningTask.learningModuleId, learningModule.id),
          )
          .where(inArray(learningPlan.id, learningPlanIds))
          .groupBy(learningPlan.id);

        for (const row of progressRows) {
          const totalLearningTasks = Number(row.totalLearningTasks ?? 0);
          const completedLearningTasks = Number(
            row.completedLearningTasks ?? 0,
          );
          progressByLearningPlanId.set(row.learningPlanId, {
            total: totalLearningTasks,
            completed: completedLearningTasks,
          });
        }
      }

      // Generate next cursor
      let nextCursor: string | null = null;
      if (hasNext && items.length > 0) {
        const lastItem = items[items.length - 1];
        if (!lastItem) {
          throw LearningPlanErrors.updateFailed();
        }
        const sortValue =
          sort === "title"
            ? lastItem.title
            : sort === "updated_at"
              ? lastItem.updatedAt
              : lastItem.createdAt;
        nextCursor = encodeCursor(lastItem.id, sort, sortValue);
      }

      // Get total count for the user (excluding cursor pagination conditions)
      const baseConditions = [eq(learningPlan.userId, userId)];

      // Add status filter if provided
      if (statusFilter) {
        baseConditions.push(eq(learningPlan.status, statusFilter));
      }

      // Add search filter if provided
      if (search) {
        baseConditions.push(
          or(
            ilike(learningPlan.title, `%${search}%`),
            ilike(learningPlan.description, `%${search}%`),
            ilike(learningPlan.learningTopic, `%${search}%`),
          )!,
        );
      }

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(learningPlan)
        .where(and(...baseConditions));

      const total = totalResult[0]?.count || 0;

      log.info("Learning plans listed successfully", {
        userId,
        count: items.length,
        total,
      });

      // Format response
      const formattedItems = items.map((item) => {
        const progress = progressByLearningPlanId.get(item.id) ?? {
          total: 0,
          completed: 0,
        };

        const learningModuleCompletionPercent = calculateCompletionPercent(
          progress.total,
          progress.completed,
        );

        return {
          id: item.publicId,
          emoji: item.emoji,
          title: item.title,
          description: item.description,
          status: item.status as "active" | "archived",
          learningModuleCompletionPercent,
          learningTopic: item.learningTopic,
          userLevel: item.userLevel,
          targetWeeks: item.targetWeeks,
          weeklyHours: item.weeklyHours,
          learningStyle: item.learningStyle,
          preferredResources: item.preferredResources,
          mainGoal: item.mainGoal,
          additionalRequirements: item.additionalRequirements,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        };
      });

      return {
        items: formattedItems,
        pagination: {
          hasNext,
          nextCursor,
          total,
        },
      };
    } catch (error) {
      // Re-throw LearningPlanError or BaseError as is
      if (error instanceof LearningPlanError || error instanceof BaseError) {
        throw error;
      }

      // Log and throw generic error for unexpected issues
      log.error("Learning plan list failed", error, {
        userId: input.userId,
      });
      throw LearningPlanErrors.updateFailed();
    }
  }

  /**
   * Updates the status of a learning plan
   * @param input - Status update data
   * @returns Updated learning plan status information
   */
  async updateLearningPlanStatus(input: UpdateLearningPlanStatusInput) {
    try {
      // Check if learningPlan exists and user has access
      const existingLearningPlan = await db
        .select({
          id: learningPlan.id,
          userId: learningPlan.userId,
          publicId: learningPlan.publicId,
          status: learningPlan.status,
        })
        .from(learningPlan)
        .where(eq(learningPlan.publicId, input.publicId))
        .limit(1);

      const [learningPlanRow] = existingLearningPlan;

      if (!learningPlanRow) {
        throw LearningPlanErrors.notFound();
      }

      if (learningPlanRow.userId !== input.userId) {
        throw LearningPlanErrors.accessDenied();
      }

      // Check if status is already the requested status
      if (learningPlanRow.status === input.status) {
        throw LearningPlanErrors.invalidStatus({
          message: `LearningPlan is already ${input.status}`,
        });
      }

      // Perform the status update
      const [updatedLearningPlan] = await db
        .update(learningPlan)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(learningPlan.publicId, input.publicId))
        .returning({
          publicId: learningPlan.publicId,
          status: learningPlan.status,
          emoji: learningPlan.emoji,
          updatedAt: learningPlan.updatedAt,
        });

      if (!updatedLearningPlan) {
        throw LearningPlanErrors.updateFailed();
      }

      log.info("Learning plan status updated successfully", {
        publicId: input.publicId,
        userId: input.userId,
        newStatus: input.status,
      });

      return {
        id: updatedLearningPlan.publicId,
        status: updatedLearningPlan.status as "active" | "archived",
        emoji: updatedLearningPlan.emoji,
        updatedAt: updatedLearningPlan.updatedAt.toISOString(),
      };
    } catch (error) {
      // Re-throw LearningPlanError as is
      if (error instanceof LearningPlanError) {
        throw error;
      }

      // Log and throw generic error for unexpected issues
      log.error("Learning plan status update failed", error, {
        publicId: input.publicId,
        userId: input.userId,
      });
      throw LearningPlanErrors.updateFailed();
    }
  }
}

// Export singleton instance
export const learningPlanService = new LearningPlanService();
