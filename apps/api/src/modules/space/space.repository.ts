import { concepts, planSessions, plans, spaces } from "@repo/database/schema";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";

import { getDb } from "../../lib/db";
import { tryPromise } from "../../lib/result";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../lib/result";

export type SpaceEntity = typeof spaces.$inferSelect;

export const spaceRepository = {
  listByUserId(userId: string): ResultAsync<
    Array<{
      id: string;
      name: string;
      description: string | null;
      icon: string | null;
      color: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>,
    AppError
  > {
    return tryPromise(() => {
      const db = getDb();
      return db
        .select({
          id: spaces.publicId,
          name: spaces.name,
          description: spaces.description,
          icon: spaces.icon,
          color: spaces.color,
          createdAt: spaces.createdAt,
          updatedAt: spaces.updatedAt,
        })
        .from(spaces)
        .where(and(eq(spaces.userId, userId), isNull(spaces.deletedAt)))
        .orderBy(desc(spaces.createdAt));
    });
  },

  listWithIncludes(
    userId: string,
    spaceIds: Array<string>,
    options: {
      includeActivePlan: boolean;
      includeLastStudiedAt: boolean;
    },
  ): ResultAsync<
    Map<
      string,
      {
        activePlan?: { id: string; title: string; progressPercent: number };
        lastStudiedAt?: Date;
      }
    >,
    AppError
  > {
    return tryPromise(async () => {
      if (spaceIds.length === 0) {
        return new Map();
      }

      const db = getDb();
      const result = new Map<
        string,
        {
          activePlan?: { id: string; title: string; progressPercent: number };
          lastStudiedAt?: Date;
        }
      >();

      // 1. Active Plan 조회 (필요한 경우)
      if (options.includeActivePlan) {
        const activePlans = await db
          .select({
            spacePublicId: spaces.publicId,
            planId: plans.publicId,
            planTitle: plans.title,
            totalSessions: sql<number>`count(${planSessions.id})`.mapWith(
              Number,
            ),
            completedSessions:
              sql<number>`sum(case when ${planSessions.status} = 'COMPLETED' then 1 else 0 end)`.mapWith(
                Number,
              ),
          })
          .from(plans)
          .innerJoin(spaces, eq(spaces.id, plans.spaceId))
          .leftJoin(planSessions, eq(planSessions.planId, plans.id))
          .where(
            and(
              inArray(spaces.publicId, spaceIds),
              eq(plans.userId, userId),
              eq(plans.status, "ACTIVE"),
              isNull(plans.deletedAt),
            ),
          )
          .groupBy(spaces.publicId, plans.publicId, plans.title);

        activePlans.forEach((row) => {
          const progressPercent =
            row.totalSessions > 0
              ? Math.round((row.completedSessions / row.totalSessions) * 100)
              : 0;

          const existing = result.get(row.spacePublicId) || {};
          result.set(row.spacePublicId, {
            ...existing,
            activePlan: {
              id: row.planId,
              title: row.planTitle,
              progressPercent,
            },
          });
        });
      }

      // 2. Last Studied At 조회 (필요한 경우)
      if (options.includeLastStudiedAt) {
        const lastStudied = await db
          .select({
            spacePublicId: spaces.publicId,
            lastLearnedAt: sql<Date | null>`max(${concepts.lastLearnedAt})`,
          })
          .from(concepts)
          .innerJoin(spaces, eq(spaces.id, concepts.spaceId))
          .where(
            and(
              inArray(spaces.publicId, spaceIds),
              eq(concepts.userId, userId),
              isNull(concepts.deletedAt),
            ),
          )
          .groupBy(spaces.publicId);

        lastStudied.forEach((row) => {
          const existing = result.get(row.spacePublicId) || {};
          result.set(row.spacePublicId, {
            ...existing,
            lastStudiedAt: row.lastLearnedAt ?? undefined,
          });
        });
      }

      return result;
    });
  },

  insert(data: typeof spaces.$inferInsert): ResultAsync<
    {
      id: string;
      name: string;
      description: string | null;
      icon: string | null;
      color: string | null;
      createdAt: Date;
      updatedAt: Date;
    } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db.insert(spaces).values(data).returning({
        id: spaces.publicId,
        name: spaces.name,
        description: spaces.description,
        icon: spaces.icon,
        color: spaces.color,
        createdAt: spaces.createdAt,
        updatedAt: spaces.updatedAt,
      });
      return rows[0] ?? null;
    });
  },

  findByPublicId(spaceId: string): ResultAsync<
    {
      id: string;
      userId: string;
      name: string;
      description: string | null;
      icon: string | null;
      color: string | null;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
    } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          id: spaces.publicId,
          userId: spaces.userId,
          name: spaces.name,
          description: spaces.description,
          icon: spaces.icon,
          color: spaces.color,
          createdAt: spaces.createdAt,
          updatedAt: spaces.updatedAt,
          deletedAt: spaces.deletedAt,
        })
        .from(spaces)
        .where(eq(spaces.publicId, spaceId))
        .limit(1);
      return rows[0] ?? null;
    });
  },

  findByIdOrPublicId(
    spaceId: string | number,
  ): ResultAsync<SpaceEntity | null, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select()
        .from(spaces)
        .where(
          typeof spaceId === "number"
            ? eq(spaces.id, spaceId)
            : eq(spaces.publicId, spaceId),
        )
        .limit(1);
      return rows[0] ?? null;
    });
  },

  update(
    userId: string,
    spaceId: string,
    updates: Partial<typeof spaces.$inferInsert>,
  ): ResultAsync<
    {
      id: string;
      name: string;
      description: string | null;
      icon: string | null;
      color: string | null;
      createdAt: Date;
      updatedAt: Date;
    } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .update(spaces)
        .set(updates)
        .where(
          and(
            eq(spaces.publicId, spaceId),
            eq(spaces.userId, userId),
            isNull(spaces.deletedAt),
          ),
        )
        .returning({
          id: spaces.publicId,
          name: spaces.name,
          description: spaces.description,
          icon: spaces.icon,
          color: spaces.color,
          createdAt: spaces.createdAt,
          updatedAt: spaces.updatedAt,
        });

      return rows[0] ?? null;
    });
  },

  softDelete(
    userId: string,
    spaceId: string,
    now: Date,
  ): ResultAsync<boolean, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .update(spaces)
        .set({ deletedAt: now, updatedAt: now })
        .where(
          and(
            eq(spaces.publicId, spaceId),
            eq(spaces.userId, userId),
            isNull(spaces.deletedAt),
          ),
        )
        .returning({ id: spaces.publicId });
      return Boolean(rows[0]);
    });
  },
};
