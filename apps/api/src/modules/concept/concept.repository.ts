import {
  conceptRelations,
  conceptReviews,
  conceptSessionLinks,
  conceptTags,
  concepts,
  planModules,
  planSessions,
  plans,
  sessionRuns,
  spaces,
  tags,
} from "@repo/database/schema";
import { and, asc, desc, eq, ilike, inArray, isNull, sql } from "drizzle-orm";

import { getDb } from "../../lib/db";
import { tryPromise } from "../../lib/result";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../lib/result";
import type { ConceptReviewStatus } from "./concept.dto";

export const conceptRepository = {
  getTagMap(
    conceptIds: ReadonlyArray<number>,
  ): ResultAsync<Map<number, Array<string>>, AppError> {
    return tryPromise(async () => {
      if (conceptIds.length === 0) return new Map<number, Array<string>>();

      const db = getDb();
      const rows = await db
        .select({
          conceptId: conceptTags.conceptId,
          tag: tags.slug,
        })
        .from(conceptTags)
        .innerJoin(tags, eq(tags.id, conceptTags.tagId))
        .where(inArray(conceptTags.conceptId, [...conceptIds]));

      const map = new Map<number, Array<string>>();
      rows.forEach((row) => {
        const list = map.get(row.conceptId) ?? [];
        list.push(row.tag);
        map.set(row.conceptId, list);
      });
      return map;
    });
  },

  countList(
    userId: string,
    spaceId: number,
    params: {
      search?: string;
      reviewStatus?: ConceptReviewStatus;
      today: Date;
      dueWindowEnd: Date;
    },
  ): ResultAsync<number, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const where = [
        eq(concepts.userId, userId),
        eq(concepts.spaceId, spaceId),
        isNull(concepts.deletedAt),
      ];

      if (params.search?.trim()) {
        const q = params.search.trim();
        where.push(
          sql`(${concepts.title} ILIKE ${`%${q}%`} OR ${concepts.oneLiner} ILIKE ${`%${q}%`})`,
        );
      }

      if (params.reviewStatus === "OVERDUE") {
        where.push(sql`${concepts.srsDueAt} < ${params.today}`);
      } else if (params.reviewStatus === "DUE") {
        where.push(
          sql`${concepts.srsDueAt} >= ${params.today} AND ${concepts.srsDueAt} <= ${params.dueWindowEnd}`,
        );
      } else if (params.reviewStatus === "GOOD") {
        where.push(
          sql`${concepts.srsDueAt} > ${params.dueWindowEnd} OR ${concepts.srsDueAt} IS NULL`,
        );
      }

      const rows = await db
        .select({ total: sql<number>`count(*)`.mapWith(Number) })
        .from(concepts)
        .where(and(...where));
      return rows[0]?.total ?? 0;
    });
  },

  list(
    userId: string,
    spaceId: number,
    params: {
      page: number;
      limit: number;
      search?: string;
      reviewStatus?: ConceptReviewStatus;
      today: Date;
      dueWindowEnd: Date;
    },
  ): ResultAsync<
    Array<{
      id: number;
      publicId: string;
      title: string;
      oneLiner: string;
      srsDueAt: Date | null;
      lastLearnedAt: Date | null;
    }>,
    AppError
  > {
    return tryPromise(() => {
      const db = getDb();
      const where = [
        eq(concepts.userId, userId),
        eq(concepts.spaceId, spaceId),
        isNull(concepts.deletedAt),
      ];

      if (params.search?.trim()) {
        const q = params.search.trim();
        where.push(
          sql`(${concepts.title} ILIKE ${`%${q}%`} OR ${concepts.oneLiner} ILIKE ${`%${q}%`})`,
        );
      }

      if (params.reviewStatus === "OVERDUE") {
        where.push(sql`${concepts.srsDueAt} < ${params.today}`);
      } else if (params.reviewStatus === "DUE") {
        where.push(
          sql`${concepts.srsDueAt} >= ${params.today} AND ${concepts.srsDueAt} <= ${params.dueWindowEnd}`,
        );
      } else if (params.reviewStatus === "GOOD") {
        where.push(
          sql`${concepts.srsDueAt} > ${params.dueWindowEnd} OR ${concepts.srsDueAt} IS NULL`,
        );
      }

      const offset = (params.page - 1) * params.limit;
      return db
        .select({
          id: concepts.id,
          publicId: concepts.publicId,
          title: concepts.title,
          oneLiner: concepts.oneLiner,
          srsDueAt: concepts.srsDueAt,
          lastLearnedAt: concepts.lastLearnedAt,
        })
        .from(concepts)
        .where(and(...where))
        .orderBy(asc(concepts.srsDueAt), desc(concepts.updatedAt))
        .limit(params.limit)
        .offset(offset);
    });
  },

  countLibrary(
    userId: string,
    params: {
      search?: string;
      reviewStatus?: ConceptReviewStatus;
      today: Date;
      dueWindowEnd: Date;
      spaceIds?: ReadonlyArray<number>;
    },
  ): ResultAsync<number, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const where = [
        eq(concepts.userId, userId),
        isNull(concepts.deletedAt),
        eq(spaces.userId, userId),
        isNull(spaces.deletedAt),
      ];

      if (params.spaceIds && params.spaceIds.length > 0) {
        where.push(inArray(concepts.spaceId, [...params.spaceIds]));
      }

      if (params.search?.trim()) {
        const q = params.search.trim();
        where.push(
          sql`(${concepts.title} ILIKE ${`%${q}%`} OR ${concepts.oneLiner} ILIKE ${`%${q}%`})`,
        );
      }

      if (params.reviewStatus === "OVERDUE") {
        where.push(sql`${concepts.srsDueAt} < ${params.today}`);
      } else if (params.reviewStatus === "DUE") {
        where.push(
          sql`${concepts.srsDueAt} >= ${params.today} AND ${concepts.srsDueAt} <= ${params.dueWindowEnd}`,
        );
      } else if (params.reviewStatus === "GOOD") {
        where.push(
          sql`${concepts.srsDueAt} > ${params.dueWindowEnd} OR ${concepts.srsDueAt} IS NULL`,
        );
      }

      const rows = await db
        .select({ total: sql<number>`count(*)`.mapWith(Number) })
        .from(concepts)
        .innerJoin(spaces, eq(spaces.id, concepts.spaceId))
        .where(and(...where));
      return rows[0]?.total ?? 0;
    });
  },

  listLibrary(
    userId: string,
    params: {
      page: number;
      limit: number;
      search?: string;
      reviewStatus?: ConceptReviewStatus;
      today: Date;
      dueWindowEnd: Date;
      spaceIds?: ReadonlyArray<number>;
    },
  ): ResultAsync<
    Array<{
      id: number;
      publicId: string;
      spaceId: string;
      title: string;
      oneLiner: string;
      srsDueAt: Date | null;
      lastLearnedAt: Date | null;
    }>,
    AppError
  > {
    return tryPromise(() => {
      const db = getDb();
      const where = [
        eq(concepts.userId, userId),
        isNull(concepts.deletedAt),
        eq(spaces.userId, userId),
        isNull(spaces.deletedAt),
      ];

      if (params.spaceIds && params.spaceIds.length > 0) {
        where.push(inArray(concepts.spaceId, [...params.spaceIds]));
      }

      if (params.search?.trim()) {
        const q = params.search.trim();
        where.push(
          sql`(${concepts.title} ILIKE ${`%${q}%`} OR ${concepts.oneLiner} ILIKE ${`%${q}%`})`,
        );
      }

      if (params.reviewStatus === "OVERDUE") {
        where.push(sql`${concepts.srsDueAt} < ${params.today}`);
      } else if (params.reviewStatus === "DUE") {
        where.push(
          sql`${concepts.srsDueAt} >= ${params.today} AND ${concepts.srsDueAt} <= ${params.dueWindowEnd}`,
        );
      } else if (params.reviewStatus === "GOOD") {
        where.push(
          sql`${concepts.srsDueAt} > ${params.dueWindowEnd} OR ${concepts.srsDueAt} IS NULL`,
        );
      }

      const offset = (params.page - 1) * params.limit;
      return db
        .select({
          id: concepts.id,
          publicId: concepts.publicId,
          spaceId: spaces.publicId,
          title: concepts.title,
          oneLiner: concepts.oneLiner,
          srsDueAt: concepts.srsDueAt,
          lastLearnedAt: concepts.lastLearnedAt,
        })
        .from(concepts)
        .innerJoin(spaces, eq(spaces.id, concepts.spaceId))
        .where(and(...where))
        .orderBy(asc(concepts.srsDueAt), desc(concepts.updatedAt))
        .limit(params.limit)
        .offset(offset);
    });
  },

  findDetailByPublicId(
    userId: string,
    conceptId: string,
  ): ResultAsync<
    {
      id: number;
      publicId: string;
      spaceId: number;
      spacePublicId: string;
      title: string;
      oneLiner: string;
      ariNoteMd: string;
      srsDueAt: Date | null;
      srsStateJson: Record<string, unknown> | null;
    } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          id: concepts.id,
          publicId: concepts.publicId,
          spaceId: concepts.spaceId,
          spacePublicId: spaces.publicId,
          title: concepts.title,
          oneLiner: concepts.oneLiner,
          ariNoteMd: concepts.ariNoteMd,
          srsDueAt: concepts.srsDueAt,
          srsStateJson: concepts.srsStateJson,
        })
        .from(concepts)
        .innerJoin(spaces, eq(spaces.id, concepts.spaceId))
        .where(
          and(
            eq(concepts.publicId, conceptId),
            eq(concepts.userId, userId),
            isNull(concepts.deletedAt),
            eq(spaces.userId, userId),
            isNull(spaces.deletedAt),
          ),
        )
        .limit(1);
      return rows[0] ?? null;
    });
  },

  listRelatedConcepts(
    userId: string,
    conceptId: number,
  ): ResultAsync<
    Array<{
      id: string;
      title: string;
      oneLiner: string;
      srsDueAt: Date | null;
    }>,
    AppError
  > {
    return tryPromise(() => {
      const db = getDb();
      return db
        .select({
          id: concepts.publicId,
          title: concepts.title,
          oneLiner: concepts.oneLiner,
          srsDueAt: concepts.srsDueAt,
        })
        .from(conceptRelations)
        .innerJoin(concepts, eq(concepts.id, conceptRelations.toConceptId))
        .where(
          and(
            eq(conceptRelations.fromConceptId, conceptId),
            eq(concepts.userId, userId),
            isNull(concepts.deletedAt),
          ),
        )
        .orderBy(desc(conceptRelations.createdAt))
        .limit(10);
    });
  },

  listLearningHistory(
    userId: string,
    conceptId: number,
  ): ResultAsync<
    Array<{
      sessionRunId: string;
      linkType: string;
      createdAt: Date;
      planId: string;
      planTitle: string;
      moduleTitle: string | null;
      sessionTitle: string;
    }>,
    AppError
  > {
    return tryPromise(() => {
      const db = getDb();
      return db
        .select({
          sessionRunId: sessionRuns.publicId,
          linkType: conceptSessionLinks.linkType,
          createdAt: conceptSessionLinks.createdAt,
          planId: plans.publicId,
          planTitle: plans.title,
          moduleTitle: planModules.title,
          sessionTitle: planSessions.title,
        })
        .from(conceptSessionLinks)
        .innerJoin(
          sessionRuns,
          eq(sessionRuns.id, conceptSessionLinks.sessionRunId),
        )
        .innerJoin(plans, eq(plans.id, sessionRuns.planId))
        .innerJoin(planSessions, eq(planSessions.id, sessionRuns.sessionId))
        .leftJoin(planModules, eq(planModules.id, planSessions.moduleId))
        .where(
          and(
            eq(conceptSessionLinks.conceptId, conceptId),
            eq(sessionRuns.userId, userId),
          ),
        )
        .orderBy(desc(conceptSessionLinks.createdAt))
        .limit(30);
    });
  },

  getLatestSourceMap(
    userId: string,
    conceptIds: ReadonlyArray<number>,
  ): ResultAsync<
    Map<
      number,
      {
        sessionRunId: string;
        linkType: string;
        createdAt: Date;
        planId: string;
        planTitle: string;
        moduleTitle: string | null;
        sessionTitle: string;
      }
    >,
    AppError
  > {
    return tryPromise(async () => {
      if (conceptIds.length === 0) {
        return new Map<
          number,
          {
            sessionRunId: string;
            linkType: string;
            createdAt: Date;
            planId: string;
            planTitle: string;
            moduleTitle: string | null;
            sessionTitle: string;
          }
        >();
      }

      const db = getDb();
      const rows = await db
        .select({
          conceptId: conceptSessionLinks.conceptId,
          sessionRunId: sessionRuns.publicId,
          linkType: conceptSessionLinks.linkType,
          createdAt: conceptSessionLinks.createdAt,
          planId: plans.publicId,
          planTitle: plans.title,
          moduleTitle: planModules.title,
          sessionTitle: planSessions.title,
        })
        .from(conceptSessionLinks)
        .innerJoin(
          sessionRuns,
          eq(sessionRuns.id, conceptSessionLinks.sessionRunId),
        )
        .innerJoin(plans, eq(plans.id, sessionRuns.planId))
        .innerJoin(planSessions, eq(planSessions.id, sessionRuns.sessionId))
        .leftJoin(planModules, eq(planModules.id, planSessions.moduleId))
        .where(
          and(
            inArray(conceptSessionLinks.conceptId, [...conceptIds]),
            eq(sessionRuns.userId, userId),
          ),
        )
        .orderBy(desc(conceptSessionLinks.createdAt));

      const map = new Map<
        number,
        {
          sessionRunId: string;
          linkType: string;
          createdAt: Date;
          planId: string;
          planTitle: string;
          moduleTitle: string | null;
          sessionTitle: string;
        }
      >();

      for (const row of rows) {
        if (!map.has(row.conceptId)) {
          map.set(row.conceptId, {
            sessionRunId: row.sessionRunId,
            linkType: row.linkType,
            createdAt: row.createdAt,
            planId: row.planId,
            planTitle: row.planTitle,
            moduleTitle: row.moduleTitle,
            sessionTitle: row.sessionTitle,
          });
        }
      }

      return map;
    });
  },

  findForReview(
    userId: string,
    conceptId: string,
  ): ResultAsync<
    {
      id: number;
      spaceId: number;
      srsStateJson: Record<string, unknown> | null;
    } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          id: concepts.id,
          spaceId: concepts.spaceId,
          srsStateJson: concepts.srsStateJson,
        })
        .from(concepts)
        .where(
          and(
            eq(concepts.publicId, conceptId),
            eq(concepts.userId, userId),
            isNull(concepts.deletedAt),
          ),
        )
        .limit(1);
      return rows[0] ?? null;
    });
  },

  findSessionRunByPublicId(
    userId: string,
    sessionRunPublicId: string,
  ): ResultAsync<{ id: number } | null, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({ id: sessionRuns.id })
        .from(sessionRuns)
        .where(
          and(
            eq(sessionRuns.publicId, sessionRunPublicId),
            eq(sessionRuns.userId, userId),
          ),
        )
        .limit(1);
      return rows[0] ?? null;
    });
  },

  insertReview(
    data: typeof conceptReviews.$inferInsert,
  ): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      await db.insert(conceptReviews).values(data);
    });
  },

  resolveSpaceIds(
    userId: string,
    spacePublicIds: ReadonlyArray<string>,
  ): ResultAsync<Array<number>, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({ id: spaces.id })
        .from(spaces)
        .where(
          and(
            eq(spaces.userId, userId),
            inArray(spaces.publicId, [...spacePublicIds]),
            isNull(spaces.deletedAt),
          ),
        );
      return rows.map((row) => row.id);
    });
  },

  search(
    userId: string,
    params: { q: string; spaceIds?: ReadonlyArray<number> },
  ): ResultAsync<
    Array<{ id: string; spaceId: string; title: string; oneLiner: string }>,
    AppError
  > {
    return tryPromise(() => {
      const db = getDb();
      const where = [eq(concepts.userId, userId), isNull(concepts.deletedAt)];
      if (params.spaceIds && params.spaceIds.length > 0) {
        where.push(inArray(concepts.spaceId, [...params.spaceIds]));
      }

      return db
        .select({
          id: concepts.publicId,
          spaceId: spaces.publicId,
          title: concepts.title,
          oneLiner: concepts.oneLiner,
        })
        .from(concepts)
        .innerJoin(spaces, eq(spaces.id, concepts.spaceId))
        .where(and(...where, ilike(concepts.title, `%${params.q}%`)))
        .orderBy(desc(concepts.updatedAt))
        .limit(20);
    });
  },

  createReviewTransaction(params: {
    conceptId: number;
    sessionRunId: number | null;
    review: {
      rating: "AGAIN" | "HARD" | "GOOD" | "EASY";
      reviewedAt: Date;
      nextDueAt: Date;
      intervalDays: number;
      easeFactor: string;
    };

    srsUpdate: {
      srsDueAt: Date;
      srsStateJson: { interval: number; ease: number };
      lastReviewedAt: Date;
    };
  }): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();

      await db.transaction(async (tx) => {
        await tx.insert(conceptReviews).values({
          id: crypto.randomUUID(),
          conceptId: params.conceptId,
          sessionRunId: params.sessionRunId,
          rating: params.review.rating,
          reviewedAt: params.review.reviewedAt,
          nextDueAt: params.review.nextDueAt,
          intervalDays: params.review.intervalDays,
          easeFactor: params.review.easeFactor,
          createdAt: params.review.reviewedAt,
        });

        await tx
          .update(concepts)
          .set({
            srsDueAt: params.srsUpdate.srsDueAt,
            srsStateJson: params.srsUpdate.srsStateJson,
            lastReviewedAt: params.srsUpdate.lastReviewedAt,
            updatedAt: params.srsUpdate.lastReviewedAt,
          })
          .where(eq(concepts.id, params.conceptId));

        if (params.sessionRunId) {
          await tx.insert(conceptSessionLinks).values({
            conceptId: params.conceptId,
            sessionRunId: params.sessionRunId,
            linkType: "REVIEWED",
            createdAt: params.review.reviewedAt,
          });
        }
      });
    });
  },
};
