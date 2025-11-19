import {
  learningModule,
  learningPlan,
  learningTask,
} from "@repo/database/schema";
import { and, asc, desc, eq, gt, ilike, lt, or, sql } from "drizzle-orm";

import { db } from "../../../database/client";

import type {
  LearningPlan,
  LearningPlanInsert,
  LearningPlanUpdate,
} from "@repo/database/types";
import type {
  PublicIdRepository,
  UserScopedRepository,
} from "../../../lib/repository/base.repository";
import type { DatabaseTransaction } from "../../../lib/transaction.helper";

/**
 * Options for finding all learning plans with pagination and filtering
 */
export interface FindAllLearningPlansOptions {
  userId: string;
  status?: "active" | "archived";
  search?: string;
  sortBy?: "created_at" | "updated_at" | "title";
  order?: "asc" | "desc";
  limit: number;
  cursor?: {
    id: number;
    value: string | Date;
  };
}

/**
 * Progress statistics for a learning plan
 */
export interface ProgressStats {
  totalTasks: number;
  completedTasks: number;
  totalModules: number;
}

/**
 * Learning plan with progress statistics
 */
export interface LearningPlanWithStats extends LearningPlan {
  totalTasks: number;
  completedTasks: number;
}

/**
 * Learning plan with nested modules and tasks
 */
export interface LearningPlanWithRelations extends LearningPlan {
  modules: Array<{
    id: number;
    publicId: string;
    title: string;
    description: string | null;
    order: number;
    isExpanded: boolean;
    createdAt: Date;
    updatedAt: Date;
    tasks: Array<{
      id: number;
      publicId: string;
      title: string;
      description: string | null;
      order: number;
      isCompleted: boolean;
      completedAt: Date | null;
      dueDate: Date | null;
      memo: string | null;
      noteStatus: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }>;
}

/**
 * Type alias for query result rows
 */
interface QueryRow {
  // Learning Plan fields
  planId: number;
  planPublicId: string;
  planTitle: string;
  planDescription: string | null;
  planEmoji: string;
  planStatus: string;
  planCreatedAt: Date;
  planUpdatedAt: Date;
  planUserId: string;
  planLearningTopic: string;
  planUserLevel: string;
  planTargetWeeks: number;
  planWeeklyHours: number;
  planLearningStyle: string;
  planPreferredResources: string;
  planMainGoal: string;
  planAdditionalRequirements: string | null;

  // Learning Module fields
  moduleId: number | null;
  modulePublicId: string | null;
  moduleTitle: string | null;
  moduleDescription: string | null;
  moduleOrder: number | null;
  moduleIsExpanded: boolean | null;
  moduleCreatedAt: Date | null;
  moduleUpdatedAt: Date | null;

  // Learning Task fields
  taskId: number | null;
  taskPublicId: string | null;
  taskTitle: string | null;
  taskDescription: string | null;
  taskOrder: number | null;
  taskIsCompleted: boolean | null;
  taskCompletedAt: Date | null;
  taskDueDate: Date | null;
  taskMemo: string | null;
  taskCreatedAt: Date | null;
  taskUpdatedAt: Date | null;

  // AI Note status
  noteStatus: string | null;
}

/**
 * Repository for learning plan data access
 * Encapsulates all database queries for learning plans
 */
export class LearningPlanRepository
  implements
    PublicIdRepository<LearningPlan, LearningPlanInsert, LearningPlanUpdate>,
    UserScopedRepository<LearningPlan>
{
  /**
   * Find a learning plan by its numeric ID
   */
  async findById(
    id: number,
    tx?: DatabaseTransaction,
  ): Promise<LearningPlan | null> {
    const executor = tx ?? db;
    const [plan] = await executor
      .select()
      .from(learningPlan)
      .where(eq(learningPlan.id, id))
      .limit(1);

    return plan || null;
  }

  /**
   * Find a learning plan by its public ID and user ID
   * Ensures authorization by checking user ownership
   */
  async findByPublicId(
    publicId: string,
    userId: string,
    tx?: DatabaseTransaction,
  ): Promise<LearningPlan | null> {
    const executor = tx ?? db;
    const [plan] = await executor
      .select()
      .from(learningPlan)
      .where(
        and(
          eq(learningPlan.publicId, publicId),
          eq(learningPlan.userId, userId),
        ),
      )
      .limit(1);

    return plan || null;
  }

  /**
   * Find all learning plans belonging to a user
   */
  async findByUserId(
    userId: string,
    tx?: DatabaseTransaction,
  ): Promise<Array<LearningPlan>> {
    const executor = tx ?? db;
    return await executor
      .select()
      .from(learningPlan)
      .where(eq(learningPlan.userId, userId));
  }

  /**
   * Find learning plans with pagination and filtering
   * Supports cursor-based pagination, search, sorting, and status filtering
   */
  async findAll(
    options: FindAllLearningPlansOptions,
    tx?: DatabaseTransaction,
  ): Promise<Array<LearningPlan>> {
    const executor = tx ?? db;
    const {
      userId,
      status,
      search,
      sortBy = "created_at",
      order = "desc",
      limit,
      cursor,
    } = options;

    const conditions = [eq(learningPlan.userId, userId)];

    // Status filter
    if (status) {
      conditions.push(eq(learningPlan.status, status));
    }

    // Search filter
    if (search) {
      conditions.push(
        or(
          ilike(learningPlan.title, `%${search}%`),
          ilike(learningPlan.description, `%${search}%`),
        )!,
      );
    }

    // Cursor condition for pagination
    if (cursor) {
      const cursorCondition = this.buildCursorCondition(sortBy, order, cursor);
      conditions.push(cursorCondition);
    }

    // Determine sort order
    const orderFn = order === "asc" ? asc : desc;

    // Map sortBy to actual column names
    const sortByColumn =
      sortBy === "created_at"
        ? learningPlan.createdAt
        : sortBy === "updated_at"
          ? learningPlan.updatedAt
          : learningPlan.title;

    return await executor
      .select()
      .from(learningPlan)
      .where(and(...conditions))
      .orderBy(orderFn(sortByColumn), desc(learningPlan.id))
      .limit(limit);
  }

  /**
   * Find learning plans with progress statistics in a single query
   * Optimized version of findAll() that includes totalTasks and completedTasks
   * Avoids N+1 queries by using JOIN and aggregation
   */
  async findAllWithStats(
    options: FindAllLearningPlansOptions,
    tx?: DatabaseTransaction,
  ): Promise<Array<LearningPlanWithStats>> {
    const executor = tx ?? db;
    const {
      userId,
      status,
      search,
      sortBy = "created_at",
      order = "desc",
      limit,
      cursor,
    } = options;

    const conditions = [eq(learningPlan.userId, userId)];

    // Status filter
    if (status) {
      conditions.push(eq(learningPlan.status, status));
    }

    // Search filter
    if (search) {
      conditions.push(
        or(
          ilike(learningPlan.title, `%${search}%`),
          ilike(learningPlan.description, `%${search}%`),
        )!,
      );
    }

    // Cursor condition for pagination
    if (cursor) {
      const cursorCondition = this.buildCursorCondition(sortBy, order, cursor);
      conditions.push(cursorCondition);
    }

    // Determine sort order
    const orderFn = order === "asc" ? asc : desc;

    // Map sortBy to actual column names
    const sortByColumn =
      sortBy === "created_at"
        ? learningPlan.createdAt
        : sortBy === "updated_at"
          ? learningPlan.updatedAt
          : learningPlan.title;

    const result = await executor
      .select({
        id: learningPlan.id,
        publicId: learningPlan.publicId,
        userId: learningPlan.userId,
        title: learningPlan.title,
        description: learningPlan.description,
        emoji: learningPlan.emoji,
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
        totalTasks: sql<number>`COUNT(DISTINCT ${learningTask.id})`,
        completedTasks: sql<number>`
          COUNT(DISTINCT ${learningTask.id})
          FILTER (WHERE ${learningTask.isCompleted} = true)
        `,
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
      .where(and(...conditions))
      .groupBy(learningPlan.id)
      .orderBy(orderFn(sortByColumn), desc(learningPlan.id))
      .limit(limit);

    return result as Array<LearningPlanWithStats>;
  }

  /**
   * Find a learning plan with all nested modules and tasks in a single query
   * Optimized to avoid N+1 queries by using JOINs
   */
  async findWithModulesAndTasks(
    publicId: string,
    userId: string,
    tx?: DatabaseTransaction,
  ): Promise<LearningPlanWithRelations | null> {
    const executor = tx ?? db;

    const rows = await executor
      .select({
        // Learning Plan fields
        planId: learningPlan.id,
        planPublicId: learningPlan.publicId,
        planTitle: learningPlan.title,
        planDescription: learningPlan.description,
        planEmoji: learningPlan.emoji,
        planStatus: learningPlan.status,
        planCreatedAt: learningPlan.createdAt,
        planUpdatedAt: learningPlan.updatedAt,
        planUserId: learningPlan.userId,
        planLearningTopic: learningPlan.learningTopic,
        planUserLevel: learningPlan.userLevel,
        planTargetWeeks: learningPlan.targetWeeks,
        planWeeklyHours: learningPlan.weeklyHours,
        planLearningStyle: learningPlan.learningStyle,
        planPreferredResources: learningPlan.preferredResources,
        planMainGoal: learningPlan.mainGoal,
        planAdditionalRequirements: learningPlan.additionalRequirements,

        // Learning Module fields
        moduleId: learningModule.id,
        modulePublicId: learningModule.publicId,
        moduleTitle: learningModule.title,
        moduleDescription: learningModule.description,
        moduleOrder: learningModule.order,
        moduleIsExpanded: learningModule.isExpanded,
        moduleCreatedAt: learningModule.createdAt,
        moduleUpdatedAt: learningModule.updatedAt,

        // Learning Task fields
        taskId: learningTask.id,
        taskPublicId: learningTask.publicId,
        taskTitle: learningTask.title,
        taskDescription: learningTask.description,
        taskOrder: learningTask.order,
        taskIsCompleted: learningTask.isCompleted,
        taskCompletedAt: learningTask.completedAt,
        taskDueDate: learningTask.dueDate,
        taskMemo: learningTask.memo,
        taskCreatedAt: learningTask.createdAt,
        taskUpdatedAt: learningTask.updatedAt,
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
      .where(
        and(
          eq(learningPlan.publicId, publicId),
          eq(learningPlan.userId, userId),
        ),
      )
      .orderBy(asc(learningModule.order), asc(learningTask.order));

    if (rows.length === 0) {
      return null;
    }

    return this.transformToHierarchy(rows as Array<QueryRow>);
  }

  /**
   * Get progress statistics for a learning plan
   * Returns total and completed counts for tasks and modules
   */
  async getProgressStats(
    planId: number,
    tx?: DatabaseTransaction,
  ): Promise<ProgressStats> {
    const executor = tx ?? db;

    const [stats] = await executor
      .select({
        totalTasks: sql<number>`COUNT(DISTINCT ${learningTask.id})`,
        completedTasks: sql<number>`
          COUNT(DISTINCT ${learningTask.id})
          FILTER (WHERE ${learningTask.isCompleted} = true)
        `,
        totalModules: sql<number>`COUNT(DISTINCT ${learningModule.id})`,
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
      .where(eq(learningPlan.id, planId));

    if (!stats) {
      return { totalTasks: 0, completedTasks: 0, totalModules: 0 };
    }

    return stats;
  }

  /**
   * Create a new learning plan
   */
  async create(
    data: LearningPlanInsert,
    tx?: DatabaseTransaction,
  ): Promise<LearningPlan> {
    const executor = tx ?? db;
    const [plan] = await executor.insert(learningPlan).values(data).returning();

    if (!plan) {
      throw new Error("Failed to create learning plan");
    }

    return plan;
  }

  /**
   * Update an existing learning plan
   */
  async update(
    id: number,
    data: LearningPlanUpdate,
    tx?: DatabaseTransaction,
  ): Promise<LearningPlan> {
    const executor = tx ?? db;
    const [plan] = await executor
      .update(learningPlan)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(learningPlan.id, id))
      .returning();

    if (!plan) {
      throw new Error("Failed to update learning plan");
    }

    return plan;
  }

  /**
   * Delete a learning plan (cascade deletes modules and tasks)
   */
  async delete(id: number, tx?: DatabaseTransaction): Promise<void> {
    const executor = tx ?? db;
    await executor.delete(learningPlan).where(eq(learningPlan.id, id));
  }

  /**
   * Build cursor condition for pagination
   * Handles both ascending and descending order
   * @private
   */
  private buildCursorCondition(
    sortBy: "created_at" | "updated_at" | "title",
    order: "asc" | "desc",
    cursor: { id: number; value: string | Date },
  ): ReturnType<typeof gt> | ReturnType<typeof lt> {
    // Map sortBy to actual column names
    const column =
      sortBy === "created_at"
        ? learningPlan.createdAt
        : sortBy === "updated_at"
          ? learningPlan.updatedAt
          : learningPlan.title;

    if (order === "asc") {
      return gt(column, cursor.value);
    } else {
      return lt(column, cursor.value);
    }
  }

  /**
   * Transform flat query rows into hierarchical structure
   * Efficiently groups modules and tasks under the plan
   * @private
   */
  private transformToHierarchy(
    rows: Array<QueryRow>,
  ): LearningPlanWithRelations {
    const firstRow = rows[0];
    if (!firstRow) {
      throw new Error("Cannot transform empty rows");
    }

    // Initialize the plan
    const plan: LearningPlanWithRelations = {
      id: firstRow.planId,
      publicId: firstRow.planPublicId,
      userId: firstRow.planUserId,
      title: firstRow.planTitle,
      description: firstRow.planDescription,
      emoji: firstRow.planEmoji,
      status: firstRow.planStatus,
      learningTopic: firstRow.planLearningTopic,
      userLevel: firstRow.planUserLevel,
      targetWeeks: firstRow.planTargetWeeks,
      weeklyHours: firstRow.planWeeklyHours,
      learningStyle: firstRow.planLearningStyle,
      preferredResources: firstRow.planPreferredResources,
      mainGoal: firstRow.planMainGoal,
      additionalRequirements: firstRow.planAdditionalRequirements,
      createdAt: firstRow.planCreatedAt,
      updatedAt: firstRow.planUpdatedAt,
      modules: [],
    };

    // Use Maps for efficient lookups
    const moduleMap = new Map<
      number,
      LearningPlanWithRelations["modules"][number]
    >();

    for (const row of rows) {
      // Skip if no module exists
      if (row.moduleId === null) continue;

      // Add module if not already present
      if (!moduleMap.has(row.moduleId)) {
        const module: LearningPlanWithRelations["modules"][number] = {
          id: row.moduleId,
          publicId: row.modulePublicId!,
          title: row.moduleTitle!,
          description: row.moduleDescription,
          order: row.moduleOrder!,
          isExpanded: row.moduleIsExpanded!,
          createdAt: row.moduleCreatedAt!,
          updatedAt: row.moduleUpdatedAt!,
          tasks: [],
        };
        moduleMap.set(row.moduleId, module);
        plan.modules.push(module);
      }

      // Add task if exists and not already added
      if (row.taskId !== null) {
        const module = moduleMap.get(row.moduleId)!;
        const taskExists = module.tasks.some((t) => t.id === row.taskId);

        if (!taskExists) {
          module.tasks.push({
            id: row.taskId,
            publicId: row.taskPublicId!,
            title: row.taskTitle!,
            description: row.taskDescription,
            order: row.taskOrder!,
            isCompleted: row.taskIsCompleted!,
            completedAt: row.taskCompletedAt,
            dueDate: row.taskDueDate,
            memo: row.taskMemo,
            noteStatus: row.noteStatus,
            createdAt: row.taskCreatedAt!,
            updatedAt: row.taskUpdatedAt!,
          });
        }
      }
    }

    return plan;
  }
}

/**
 * Singleton instance for convenience
 */
export const learningPlanRepository = new LearningPlanRepository();
