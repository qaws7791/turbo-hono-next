import { and, desc, eq, isNull } from "drizzle-orm";
import { spaces } from "@repo/database/schema";

import { getDb } from "../../lib/db";
import { tryPromise } from "../../lib/result";

import type { AppError } from "../../lib/result";
import type { ResultAsync } from "neverthrow";

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
