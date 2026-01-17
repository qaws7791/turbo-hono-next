import {
  materials,
  planModules,
  planSessions,
  planSourceMaterials,
  plans,
} from "@repo/database/schema";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";

import { tryPromise } from "../../lib/result";

import type { Database } from "@repo/database";
import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../lib/result";
import type { PlanStatus } from "./plan.dto";

export type PlanEntity = typeof plans.$inferSelect;
export type InsertPlanEntity = typeof plans.$inferInsert;

export function createPlanRepository(db: Database) {
  return {
    countByUserId(
      userId: string,
      status?: PlanStatus,
    ): ResultAsync<number, AppError> {
      return tryPromise(async () => {
        const where = [eq(plans.userId, userId), isNull(plans.deletedAt)];
        if (status) where.push(eq(plans.status, status));

        const rows = await db
          .select({ total: sql<number>`count(*)`.mapWith(Number) })
          .from(plans)
          .where(and(...where));
        return rows[0]?.total ?? 0;
      });
    },

    listByUserId(
      userId: string,
      options: { page: number; limit: number; status?: PlanStatus },
    ): ResultAsync<
      Array<{
        id: number;
        publicId: string;
        title: string;
        icon: string;
        color: string;
        status: PlanStatus;
        goalType: string;
        currentLevel: string;
        createdAt: Date;
        updatedAt: Date;
      }>,
      AppError
    > {
      return tryPromise(() => {
        const where = [eq(plans.userId, userId), isNull(plans.deletedAt)];
        if (options.status) where.push(eq(plans.status, options.status));

        const offset = (options.page - 1) * options.limit;
        return db
          .select({
            id: plans.id,
            publicId: plans.publicId,
            title: plans.title,
            icon: plans.icon,
            color: plans.color,
            status: plans.status,
            goalType: plans.goalType,
            currentLevel: plans.currentLevel,
            createdAt: plans.createdAt,
            updatedAt: plans.updatedAt,
          })
          .from(plans)
          .where(and(...where))
          .orderBy(desc(plans.createdAt))
          .limit(options.limit)
          .offset(offset);
      });
    },

    getProgressMap(
      planIds: ReadonlyArray<number>,
    ): ResultAsync<
      Map<number, { totalSessions: number; completedSessions: number }>,
      AppError
    > {
      return tryPromise(async () => {
        if (planIds.length === 0) {
          return new Map<
            number,
            { totalSessions: number; completedSessions: number }
          >();
        }

        const rows = await db
          .select({
            planId: planSessions.planId,
            totalSessions: sql<number>`count(*)`.mapWith(Number),
            completedSessions:
              sql<number>`sum(case when ${planSessions.status} = 'COMPLETED' then 1 else 0 end)`.mapWith(
                Number,
              ),
          })
          .from(planSessions)
          .where(inArray(planSessions.planId, [...planIds]))
          .groupBy(planSessions.planId);

        const map = new Map<
          number,
          { totalSessions: number; completedSessions: number }
        >();
        rows.forEach((row) => {
          map.set(row.planId, {
            totalSessions: row.totalSessions,
            completedSessions: row.completedSessions,
          });
        });
        return map;
      });
    },

    findDetailByPublicId(
      userId: string,
      planPublicId: string,
    ): ResultAsync<
      {
        internalId: number;
        id: string;
        title: string;
        icon: string;
        color: string;
        status: PlanStatus;
        goalType: string;
        currentLevel: string;
        targetDueDate: Date;
        specialRequirements: string | null;
        createdAt: Date;
        updatedAt: Date;
      } | null,
      AppError
    > {
      return tryPromise(async () => {
        const rows = await db
          .select({
            internalId: plans.id,
            id: plans.publicId,
            title: plans.title,
            icon: plans.icon,
            color: plans.color,
            status: plans.status,
            goalType: plans.goalType,
            currentLevel: plans.currentLevel,
            targetDueDate: plans.targetDueDate,
            specialRequirements: plans.specialRequirements,
            createdAt: plans.createdAt,
            updatedAt: plans.updatedAt,
          })
          .from(plans)
          .where(
            and(
              eq(plans.publicId, planPublicId),
              eq(plans.userId, userId),
              isNull(plans.deletedAt),
            ),
          )
          .limit(1);

        return rows[0] ?? null;
      });
    },

    findByPublicId(
      userId: string,
      planPublicId: string,
    ): ResultAsync<
      {
        id: number;
        publicId: string;
        title: string;
        icon: string;
        color: string;
        status: PlanStatus;
      } | null,
      AppError
    > {
      return tryPromise(async () => {
        const rows = await db
          .select({
            id: plans.id,
            publicId: plans.publicId,
            title: plans.title,
            icon: plans.icon,
            color: plans.color,
            status: plans.status,
          })
          .from(plans)
          .where(
            and(
              eq(plans.publicId, planPublicId),
              eq(plans.userId, userId),
              isNull(plans.deletedAt),
            ),
          )
          .limit(1);
        return rows[0] ?? null;
      });
    },

    listModulesByPlanId(planId: number): ResultAsync<
      Array<{
        id: string;
        title: string;
        description: string | null;
        orderIndex: number;
      }>,
      AppError
    > {
      return tryPromise(async () => {
        const rows = await db
          .select({
            id: planModules.id,
            title: planModules.title,
            description: planModules.description,
            orderIndex: planModules.orderIndex,
          })
          .from(planModules)
          .where(eq(planModules.planId, planId))
          .orderBy(planModules.orderIndex);

        return rows;
      });
    },

    listSessionsByPlanId(planId: number): ResultAsync<
      Array<{
        id: string;
        moduleId: string | null;
        sessionType: string;
        title: string;
        objective: string | null;
        orderIndex: number;
        scheduledForDate: Date;
        estimatedMinutes: number;
        status: string;
        completedAt: Date | null;
      }>,
      AppError
    > {
      return tryPromise(async () => {
        const rows = await db
          .select({
            id: planSessions.publicId,
            moduleId: planSessions.moduleId,
            sessionType: planSessions.sessionType,
            title: planSessions.title,
            objective: planSessions.objective,
            orderIndex: planSessions.orderIndex,
            scheduledForDate: planSessions.scheduledForDate,
            estimatedMinutes: planSessions.estimatedMinutes,
            status: planSessions.status,
            completedAt: planSessions.completedAt,
          })
          .from(planSessions)
          .where(eq(planSessions.planId, planId))
          .orderBy(planSessions.orderIndex);

        return rows;
      });
    },

    findMaterialsByIds(materialIds: ReadonlyArray<string>): ResultAsync<
      Array<{
        id: string;
        title: string;
        processingStatus: string;
        deletedAt: Date | null;
        userId: string;
      }>,
      AppError
    > {
      return tryPromise(() => {
        return db
          .select({
            id: materials.id,
            title: materials.title,
            processingStatus: materials.processingStatus,
            deletedAt: materials.deletedAt,
            userId: materials.userId,
          })
          .from(materials)
          .where(inArray(materials.id, [...materialIds]));
      });
    },

    listSourceMaterialIds(
      planId: number,
    ): ResultAsync<Array<string>, AppError> {
      return tryPromise(async () => {
        const rows = await db
          .select({ materialId: planSourceMaterials.materialId })
          .from(planSourceMaterials)
          .where(eq(planSourceMaterials.planId, planId));
        return rows.map((row) => row.materialId);
      });
    },

    getSourceMaterialIdsMap(
      planIds: ReadonlyArray<number>,
    ): ResultAsync<Map<number, Array<string>>, AppError> {
      return tryPromise(async () => {
        if (planIds.length === 0) {
          return new Map<number, Array<string>>();
        }

        const rows = await db
          .select({
            planId: planSourceMaterials.planId,
            materialId: planSourceMaterials.materialId,
          })
          .from(planSourceMaterials)
          .where(inArray(planSourceMaterials.planId, [...planIds]));

        const map = new Map<number, Array<string>>();
        rows.forEach((row) => {
          const existing = map.get(row.planId) ?? [];
          existing.push(row.materialId);
          map.set(row.planId, existing);
        });
        return map;
      });
    },

    pauseActivePlansForUser(
      db: Database,
      userId: string,
      now: Date,
      exceptPlanId?: number,
    ): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        const where = [eq(plans.userId, userId), eq(plans.status, "ACTIVE")];
        if (exceptPlanId !== undefined) {
          where.push(sql`${plans.id} <> ${exceptPlanId}`);
        }

        await db
          .update(plans)
          .set({ status: "PAUSED", updatedAt: now })
          .where(and(...where));
      });
    },

    insertPlan(
      db: Database,
      data: InsertPlanEntity,
    ): ResultAsync<{ id: number; publicId: string }, AppError> {
      return tryPromise(async () => {
        const rows = await db
          .insert(plans)
          .values(data)
          .returning({ id: plans.id, publicId: plans.publicId });

        const created = rows[0];
        if (!created) {
          throw new Error("Failed to insert plan");
        }

        return created;
      });
    },

    insertSourceMaterials(
      db: Database,
      rows: Array<
        typeof planSourceMaterials.$inferInsert & { createdAt: Date }
      >,
    ): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        await db.insert(planSourceMaterials).values(rows);
      });
    },

    insertPlanModules(
      db: Database,
      rows: Array<typeof planModules.$inferInsert>,
    ): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        await db.insert(planModules).values(rows);
      });
    },

    insertPlanSessions(
      db: Database,
      rows: Array<typeof planSessions.$inferInsert>,
    ): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        await db.insert(planSessions).values(rows);
      });
    },

    setPlanStatus(
      db: Database,
      planId: number,
      status: PlanStatus,
      now: Date,
      archivedAt: Date | null,
    ): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        await db
          .update(plans)
          .set({ status, updatedAt: now, archivedAt })
          .where(eq(plans.id, planId));
      });
    },

    updatePlan(
      planId: number,
      data: {
        title?: string;
        icon?: string;
        color?: string;
        status?: PlanStatus;
      },
      now: Date,
    ): ResultAsync<
      {
        id: string;
        title: string;
        icon: string;
        color: string;
        status: PlanStatus;
      },
      AppError
    > {
      return tryPromise(async () => {
        const rows = await db
          .update(plans)
          .set({ ...data, updatedAt: now })
          .where(eq(plans.id, planId))
          .returning({
            id: plans.publicId,
            title: plans.title,
            icon: plans.icon,
            color: plans.color,
            status: plans.status,
          });

        const updated = rows[0];
        if (!updated) {
          throw new Error("Failed to update plan");
        }
        return updated;
      });
    },

    deleteSourceMaterials(
      db: Database,
      planId: number,
    ): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        await db
          .delete(planSourceMaterials)
          .where(eq(planSourceMaterials.planId, planId));
      });
    },

    deletePlan(planId: number): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        await db.delete(plans).where(eq(plans.id, planId));
      });
    },

    gcZombieMaterials(
      materialIds: ReadonlyArray<string>,
    ): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        if (materialIds.length === 0) return;

        for (const materialId of materialIds) {
          const materialRows = await db
            .select({
              id: materials.id,
              deletedAt: materials.deletedAt,
            })
            .from(materials)
            .where(eq(materials.id, materialId))
            .limit(1);

          const material = materialRows[0];
          if (!material || !material.deletedAt) continue;

          const refs = await db
            .select({ planId: planSourceMaterials.planId })
            .from(planSourceMaterials)
            .where(eq(planSourceMaterials.materialId, materialId))
            .limit(1);

          if (refs[0]) continue;

          await db.delete(materials).where(eq(materials.id, materialId));
        }
      });
    },

    createPlanTransaction(params: {
      userId: string;
      planData: InsertPlanEntity;
      sourceRows: Array<{
        planId: number;
        materialId: string;
        materialTitleSnapshot: string | null;
        orderIndex: number;
        createdAt: Date;
      }>;
      moduleRows: Array<typeof planModules.$inferInsert>;
      sessionRows: Array<typeof planSessions.$inferInsert>;
    }): ResultAsync<{ id: number; publicId: string }, AppError> {
      return tryPromise(async () => {
        let result: { id: number; publicId: string } | null = null;

        await db.transaction(async (tx) => {
          // Pause active plans for user
          await tx
            .update(plans)
            .set({
              status: "PAUSED",
              updatedAt: params.planData.createdAt ?? new Date(),
            })
            .where(
              and(eq(plans.userId, params.userId), eq(plans.status, "ACTIVE")),
            );

          // Insert plan
          const createdRows = await tx
            .insert(plans)
            .values(params.planData)
            .returning({ id: plans.id, publicId: plans.publicId });

          const created = createdRows[0];
          if (!created) {
            throw new Error("Failed to insert plan");
          }

          // Insert source materials
          if (params.sourceRows.length > 0) {
            await tx.insert(planSourceMaterials).values(
              params.sourceRows.map((row) => ({
                ...row,
                planId: created.id,
              })),
            );
          }

          // Insert modules
          if (params.moduleRows.length > 0) {
            await tx.insert(planModules).values(
              params.moduleRows.map((row) => ({
                ...row,
                planId: created.id,
              })),
            );
          }

          // Insert sessions
          if (params.sessionRows.length > 0) {
            await tx.insert(planSessions).values(
              params.sessionRows.map((row) => ({
                ...row,
                planId: created.id,
              })),
            );
          }

          result = created;
        });

        if (!result) {
          throw new Error("Failed to create plan");
        }

        return result;
      });
    },

    updatePlanStatusTransaction(params: {
      planId: number;
      status: PlanStatus;
      now: Date;
    }): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        await db.transaction(async (tx) => {
          await tx
            .update(plans)
            .set({
              status: params.status,
              updatedAt: params.now,
              archivedAt: params.status === "ARCHIVED" ? params.now : null,
            })
            .where(eq(plans.id, params.planId));

          if (params.status === "ARCHIVED") {
            await tx
              .delete(planSourceMaterials)
              .where(eq(planSourceMaterials.planId, params.planId));
          }
        });
      });
    },

    activatePlanTransaction(params: {
      plan: { id: number };
      userId: string;
      now: Date;
    }): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        await db.transaction(async (tx) => {
          // Pause other active plans for user
          await tx
            .update(plans)
            .set({ status: "PAUSED", updatedAt: params.now })
            .where(
              and(
                eq(plans.userId, params.userId),
                eq(plans.status, "ACTIVE"),
                sql`${plans.id} <> ${params.plan.id}`,
              ),
            );

          // Activate the target plan
          await tx
            .update(plans)
            .set({ status: "ACTIVE", updatedAt: params.now })
            .where(eq(plans.id, params.plan.id));
        });
      });
    },
  };
}

export type PlanRepository = ReturnType<typeof createPlanRepository>;
