import { learningModule, learningTask } from "@repo/database/schema";
import { and, asc, eq, gte, sql } from "drizzle-orm";

import { db } from "../../../database/client";

import type {
  LearningModule,
  LearningModuleInsert,
  LearningModuleUpdate,
} from "@repo/database/types";
import type { DatabaseTransaction } from "../../../lib/transaction.helper";
import type { PublicIdRepository } from "../../../lib/repository/base.repository";

/**
 * Learning module with nested tasks
 */
export interface LearningModuleWithTasks extends LearningModule {
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
    createdAt: Date;
    updatedAt: Date;
  }>;
}

/**
 * Repository for learning module data access
 * Handles all database operations related to learning modules
 */
export class LearningModuleRepository
  implements
    PublicIdRepository<
      LearningModule,
      LearningModuleInsert,
      LearningModuleUpdate
    >
{
  /**
   * Find a learning module by its numeric ID
   */
  async findById(
    id: number,
    tx?: DatabaseTransaction,
  ): Promise<LearningModule | null> {
    const executor = tx ?? db;
    const [module] = await executor
      .select()
      .from(learningModule)
      .where(eq(learningModule.id, id))
      .limit(1);

    return module || null;
  }

  /**
   * Find a learning module by its public ID
   * Note: Does not validate user ownership - use with authorization checks
   */
  async findByPublicId(
    publicId: string,
    _userId: string,
    tx?: DatabaseTransaction,
  ): Promise<LearningModule | null> {
    const executor = tx ?? db;
    const [module] = await executor
      .select()
      .from(learningModule)
      .where(eq(learningModule.publicId, publicId))
      .limit(1);

    return module || null;
  }

  /**
   * Find all modules belonging to a learning plan
   * Results are ordered by the module order field
   */
  async findByLearningPlanId(
    learningPlanId: number,
    tx?: DatabaseTransaction,
  ): Promise<Array<LearningModule>> {
    const executor = tx ?? db;
    return await executor
      .select()
      .from(learningModule)
      .where(eq(learningModule.learningPlanId, learningPlanId))
      .orderBy(asc(learningModule.order));
  }

  /**
   * Find a module with all its tasks
   */
  async findWithTasks(
    publicId: string,
    tx?: DatabaseTransaction,
  ): Promise<LearningModuleWithTasks | null> {
    const executor = tx ?? db;

    const rows = await executor
      .select({
        // Module fields
        moduleId: learningModule.id,
        modulePublicId: learningModule.publicId,
        moduleLearningPlanId: learningModule.learningPlanId,
        moduleTitle: learningModule.title,
        moduleDescription: learningModule.description,
        moduleOrder: learningModule.order,
        moduleIsExpanded: learningModule.isExpanded,
        moduleCreatedAt: learningModule.createdAt,
        moduleUpdatedAt: learningModule.updatedAt,

        // Task fields
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
      .from(learningModule)
      .leftJoin(
        learningTask,
        eq(learningTask.learningModuleId, learningModule.id),
      )
      .where(eq(learningModule.publicId, publicId))
      .orderBy(asc(learningTask.order));

    if (rows.length === 0) {
      return null;
    }

    const firstRow = rows[0];
    if (!firstRow) {
      return null;
    }

    const module: LearningModuleWithTasks = {
      id: firstRow.moduleId,
      publicId: firstRow.modulePublicId,
      learningPlanId: firstRow.moduleLearningPlanId,
      title: firstRow.moduleTitle,
      description: firstRow.moduleDescription,
      order: firstRow.moduleOrder,
      isExpanded: firstRow.moduleIsExpanded,
      createdAt: firstRow.moduleCreatedAt,
      updatedAt: firstRow.moduleUpdatedAt,
      tasks: [],
    };

    for (const row of rows) {
      if (row.taskId !== null) {
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
          createdAt: row.taskCreatedAt!,
          updatedAt: row.taskUpdatedAt!,
        });
      }
    }

    return module;
  }

  /**
   * Get the maximum order value for modules in a learning plan
   * Useful for determining where to insert new modules
   */
  async getMaxOrder(
    learningPlanId: number,
    tx?: DatabaseTransaction,
  ): Promise<number> {
    const executor = tx ?? db;

    const [result] = await executor
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${learningModule.order}), 0)`,
      })
      .from(learningModule)
      .where(eq(learningModule.learningPlanId, learningPlanId));

    return result?.maxOrder ?? 0;
  }

  /**
   * Update order for modules with order greater than or equal to the given order
   * Used when inserting or removing modules
   */
  async incrementOrdersFrom(
    learningPlanId: number,
    fromOrder: number,
    tx?: DatabaseTransaction,
  ): Promise<void> {
    const executor = tx ?? db;

    await executor
      .update(learningModule)
      .set({
        order: sql`${learningModule.order} + 1`,
      })
      .where(
        and(
          eq(learningModule.learningPlanId, learningPlanId),
          gte(learningModule.order, fromOrder),
        ),
      );
  }

  /**
   * Decrement order for modules with order greater than the given order
   * Used when removing a module to fill the gap
   */
  async decrementOrdersFrom(
    learningPlanId: number,
    fromOrder: number,
    tx?: DatabaseTransaction,
  ): Promise<void> {
    const executor = tx ?? db;

    await executor
      .update(learningModule)
      .set({
        order: sql`${learningModule.order} - 1`,
      })
      .where(
        and(
          eq(learningModule.learningPlanId, learningPlanId),
          gte(learningModule.order, fromOrder),
        ),
      );
  }

  /**
   * Create a new learning module
   */
  async create(
    data: LearningModuleInsert,
    tx?: DatabaseTransaction,
  ): Promise<LearningModule> {
    const executor = tx ?? db;
    const [module] = await executor
      .insert(learningModule)
      .values(data)
      .returning();

    if (!module) {
      throw new Error("Failed to create learning module");
    }

    return module;
  }

  /**
   * Update an existing learning module
   */
  async update(
    id: number,
    data: LearningModuleUpdate,
    tx?: DatabaseTransaction,
  ): Promise<LearningModule> {
    const executor = tx ?? db;
    const [module] = await executor
      .update(learningModule)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(learningModule.id, id))
      .returning();

    if (!module) {
      throw new Error("Failed to update learning module");
    }

    return module;
  }

  /**
   * Delete a learning module (cascade deletes tasks)
   */
  async delete(id: number, tx?: DatabaseTransaction): Promise<void> {
    const executor = tx ?? db;
    await executor.delete(learningModule).where(eq(learningModule.id, id));
  }
}

/**
 * Singleton instance for convenience
 */
export const learningModuleRepository = new LearningModuleRepository();
