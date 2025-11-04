import {
  learningModule,
  learningPlan,
  learningTask,
} from "@repo/database/schema";
import { and, asc, eq, gte, sql } from "drizzle-orm";

import { db } from "../../../database/client";

import type {
  LearningTask,
  LearningTaskInsert,
  LearningTaskUpdate,
} from "@repo/database/types";
import type { PublicIdRepository } from "../../../lib/repository/base.repository";
import type { DatabaseTransaction } from "../../../lib/transaction.helper";

/**
 * Learning task with parent module and plan information
 */
export interface LearningTaskWithParents extends LearningTask {
  module: {
    id: number;
    publicId: string;
    title: string;
    description: string | null;
    order: number;
    learningPlanId: number;
  };
  plan: {
    id: number;
    publicId: string;
    userId: string;
    title: string;
  };
}

/**
 * Repository for learning task data access
 * Handles all database operations related to learning tasks
 */
export class LearningTaskRepository
  implements
    PublicIdRepository<LearningTask, LearningTaskInsert, LearningTaskUpdate>
{
  /**
   * Find a learning task by its numeric ID
   */
  async findById(
    id: number,
    tx?: DatabaseTransaction,
  ): Promise<LearningTask | null> {
    const executor = tx ?? db;
    const [task] = await executor
      .select()
      .from(learningTask)
      .where(eq(learningTask.id, id))
      .limit(1);

    return task || null;
  }

  /**
   * Find a learning task by its public ID
   * Note: Does not validate user ownership - use with authorization checks
   */
  async findByPublicId(
    publicId: string,
    _userId: string,
    tx?: DatabaseTransaction,
  ): Promise<LearningTask | null> {
    const executor = tx ?? db;
    const [task] = await executor
      .select()
      .from(learningTask)
      .where(eq(learningTask.publicId, publicId))
      .limit(1);

    return task || null;
  }

  /**
   * Find a learning task with parent module and plan information
   * Useful for authorization checks
   */
  async findWithParents(
    publicId: string,
    tx?: DatabaseTransaction,
  ): Promise<LearningTaskWithParents | null> {
    const executor = tx ?? db;

    const [row] = await executor
      .select({
        // Task fields
        taskId: learningTask.id,
        taskPublicId: learningTask.publicId,
        taskLearningModuleId: learningTask.learningModuleId,
        taskTitle: learningTask.title,
        taskDescription: learningTask.description,
        taskIsCompleted: learningTask.isCompleted,
        taskCompletedAt: learningTask.completedAt,
        taskDueDate: learningTask.dueDate,
        taskMemo: learningTask.memo,
        taskOrder: learningTask.order,
        taskCreatedAt: learningTask.createdAt,
        taskUpdatedAt: learningTask.updatedAt,

        // Module fields
        moduleId: learningModule.id,
        modulePublicId: learningModule.publicId,
        moduleTitle: learningModule.title,
        moduleDescription: learningModule.description,
        moduleOrder: learningModule.order,
        moduleLearningPlanId: learningModule.learningPlanId,

        // Plan fields
        planId: learningPlan.id,
        planPublicId: learningPlan.publicId,
        planUserId: learningPlan.userId,
        planTitle: learningPlan.title,
      })
      .from(learningTask)
      .innerJoin(
        learningModule,
        eq(learningTask.learningModuleId, learningModule.id),
      )
      .innerJoin(
        learningPlan,
        eq(learningModule.learningPlanId, learningPlan.id),
      )
      .where(eq(learningTask.publicId, publicId))
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      id: row.taskId,
      publicId: row.taskPublicId,
      learningModuleId: row.taskLearningModuleId,
      title: row.taskTitle,
      description: row.taskDescription,
      isCompleted: row.taskIsCompleted,
      completedAt: row.taskCompletedAt,
      dueDate: row.taskDueDate,
      memo: row.taskMemo,
      order: row.taskOrder,
      createdAt: row.taskCreatedAt,
      updatedAt: row.taskUpdatedAt,
      module: {
        id: row.moduleId,
        publicId: row.modulePublicId,
        title: row.moduleTitle,
        description: row.moduleDescription,
        order: row.moduleOrder,
        learningPlanId: row.moduleLearningPlanId,
      },
      plan: {
        id: row.planId,
        publicId: row.planPublicId,
        userId: row.planUserId,
        title: row.planTitle,
      },
    };
  }

  /**
   * Find all tasks belonging to a learning module
   * Results are ordered by the task order field
   */
  async findByLearningModuleId(
    learningModuleId: number,
    tx?: DatabaseTransaction,
  ): Promise<Array<LearningTask>> {
    const executor = tx ?? db;
    return await executor
      .select()
      .from(learningTask)
      .where(eq(learningTask.learningModuleId, learningModuleId))
      .orderBy(asc(learningTask.order));
  }

  /**
   * Get the maximum order value for tasks in a learning module
   * Useful for determining where to insert new tasks
   */
  async getMaxOrder(
    learningModuleId: number,
    tx?: DatabaseTransaction,
  ): Promise<number> {
    const executor = tx ?? db;

    const [result] = await executor
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${learningTask.order}), 0)`,
      })
      .from(learningTask)
      .where(eq(learningTask.learningModuleId, learningModuleId));

    return result?.maxOrder ?? 0;
  }

  /**
   * Update order for tasks with order greater than or equal to the given order
   * Used when inserting or removing tasks
   */
  async incrementOrdersFrom(
    learningModuleId: number,
    fromOrder: number,
    tx?: DatabaseTransaction,
  ): Promise<void> {
    const executor = tx ?? db;

    await executor
      .update(learningTask)
      .set({
        order: sql`${learningTask.order} + 1`,
      })
      .where(
        and(
          eq(learningTask.learningModuleId, learningModuleId),
          gte(learningTask.order, fromOrder),
        ),
      );
  }

  /**
   * Decrement order for tasks with order greater than the given order
   * Used when removing a task to fill the gap
   */
  async decrementOrdersFrom(
    learningModuleId: number,
    fromOrder: number,
    tx?: DatabaseTransaction,
  ): Promise<void> {
    const executor = tx ?? db;

    await executor
      .update(learningTask)
      .set({
        order: sql`${learningTask.order} - 1`,
      })
      .where(
        and(
          eq(learningTask.learningModuleId, learningModuleId),
          gte(learningTask.order, fromOrder),
        ),
      );
  }

  /**
   * Create a new learning task
   */
  async create(
    data: LearningTaskInsert,
    tx?: DatabaseTransaction,
  ): Promise<LearningTask> {
    const executor = tx ?? db;
    const [task] = await executor.insert(learningTask).values(data).returning();

    if (!task) {
      throw new Error("Failed to create learning task");
    }

    return task;
  }

  /**
   * Update an existing learning task
   */
  async update(
    id: number,
    data: LearningTaskUpdate,
    tx?: DatabaseTransaction,
  ): Promise<LearningTask> {
    const executor = tx ?? db;
    const [task] = await executor
      .update(learningTask)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(learningTask.id, id))
      .returning();

    if (!task) {
      throw new Error("Failed to update learning task");
    }

    return task;
  }

  /**
   * Delete a learning task
   */
  async delete(id: number, tx?: DatabaseTransaction): Promise<void> {
    const executor = tx ?? db;
    await executor.delete(learningTask).where(eq(learningTask.id, id));
  }
}

/**
 * Singleton instance for convenience
 */
export const learningTaskRepository = new LearningTaskRepository();
