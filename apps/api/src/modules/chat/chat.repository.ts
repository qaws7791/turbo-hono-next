import {
  chatCitations,
  chatMessages,
  chatThreads,
  conceptSessionLinks,
  concepts,
  materialChunks,
  materialEmbeddings,
  materials,
  planSessions,
  planSourceMaterials,
  plans,
  sessionRuns,
  spaces,
} from "@repo/database/schema";
import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { errAsync, okAsync } from "neverthrow";

import { embedTexts } from "../../ai/ingestion/embed";
import { CONFIG } from "../../lib/config";
import { getDb } from "../../lib/db";
import { requireOpenAi } from "../../lib/openai";
import { tryPromise } from "../../lib/result";
import { ApiError } from "../../middleware/error-handler";

import { vectorLiteral } from "./chat.utils";

import type { ChatScopeType } from "./chat.dto";
import type { AppError } from "../../lib/result";
import type { ResultAsync } from "neverthrow";

export const chatRepository = {
  getScopeSpaceId(
    userId: string,
    scopeType: ChatScopeType,
    scopeId: string,
  ): ResultAsync<{ spaceId: number; scopeId: number }, AppError> {
    if (scopeType === "SPACE") {
      return tryPromise(async () => {
        const db = getDb();
        const rows = await db
          .select({
            id: spaces.id,
            userId: spaces.userId,
            deletedAt: spaces.deletedAt,
          })
          .from(spaces)
          .where(eq(spaces.publicId, scopeId))
          .limit(1);
        return rows[0] ?? null;
      }).andThen((space) => {
        if (!space || space.deletedAt) {
          return errAsync(
            new ApiError(404, "SPACE_NOT_FOUND", "Space를 찾을 수 없습니다.", {
              spaceId: scopeId,
            }),
          );
        }
        if (space.userId !== userId) {
          return errAsync(
            new ApiError(
              403,
              "SPACE_ACCESS_DENIED",
              "이 Space에 접근할 수 없습니다.",
              {
                spaceId: scopeId,
              },
            ),
          );
        }
        return okAsync({ spaceId: space.id, scopeId: space.id });
      });
    }

    if (scopeType === "PLAN") {
      return tryPromise(async () => {
        const db = getDb();
        const rows = await db
          .select({ id: plans.id, spaceId: plans.spaceId })
          .from(plans)
          .where(
            and(
              eq(plans.publicId, scopeId),
              eq(plans.userId, userId),
              isNull(plans.deletedAt),
            ),
          )
          .limit(1);
        return rows[0] ?? null;
      }).andThen((plan) => {
        if (!plan) {
          return errAsync(
            new ApiError(404, "PLAN_NOT_FOUND", "Plan을 찾을 수 없습니다."),
          );
        }
        return okAsync({ spaceId: plan.spaceId, scopeId: plan.id });
      });
    }

    if (scopeType === "SESSION") {
      return tryPromise(async () => {
        const db = getDb();
        const rows = await db
          .select({ id: planSessions.id, spaceId: plans.spaceId })
          .from(planSessions)
          .innerJoin(plans, eq(plans.id, planSessions.planId))
          .where(
            and(
              eq(planSessions.publicId, scopeId),
              eq(plans.userId, userId),
              isNull(plans.deletedAt),
            ),
          )
          .limit(1);
        return rows[0] ?? null;
      }).andThen((session) => {
        if (!session) {
          return errAsync(
            new ApiError(404, "SESSION_NOT_FOUND", "세션을 찾을 수 없습니다."),
          );
        }
        return okAsync({ spaceId: session.spaceId, scopeId: session.id });
      });
    }

    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({ id: concepts.id, spaceId: concepts.spaceId })
        .from(concepts)
        .where(
          and(
            eq(concepts.publicId, scopeId),
            eq(concepts.userId, userId),
            isNull(concepts.deletedAt),
          ),
        )
        .limit(1);
      return rows[0] ?? null;
    }).andThen((concept) => {
      if (!concept) {
        return errAsync(
          new ApiError(404, "CONCEPT_NOT_FOUND", "Concept를 찾을 수 없습니다."),
        );
      }
      return okAsync({ spaceId: concept.spaceId, scopeId: concept.id });
    });
  },

  getMaterialIdsForScope(
    userId: string,
    scopeType: ChatScopeType,
    scopeId: number,
  ): ResultAsync<Array<string>, AppError> {
    if (scopeType === "PLAN") {
      return tryPromise(() => {
        const db = getDb();
        return db
          .select({ materialId: planSourceMaterials.materialId })
          .from(planSourceMaterials)
          .innerJoin(plans, eq(plans.id, planSourceMaterials.planId))
          .where(
            and(
              eq(plans.id, scopeId),
              eq(plans.userId, userId),
              isNull(plans.deletedAt),
            ),
          )
          .orderBy(asc(planSourceMaterials.orderIndex));
      }).map((rows) => rows.map((row) => row.materialId));
    }

    if (scopeType === "SESSION") {
      return tryPromise(async () => {
        const db = getDb();
        const sessionRows = await db
          .select({ planId: planSessions.planId })
          .from(planSessions)
          .innerJoin(plans, eq(plans.id, planSessions.planId))
          .where(
            and(
              eq(planSessions.id, scopeId),
              eq(plans.userId, userId),
              isNull(plans.deletedAt),
            ),
          )
          .limit(1);
        return sessionRows[0] ?? null;
      }).andThen((session) => {
        if (!session) return okAsync<Array<string>, AppError>([]);
        return chatRepository.getMaterialIdsForScope(
          userId,
          "PLAN",
          session.planId,
        );
      });
    }

    if (scopeType === "CONCEPT") {
      return tryPromise(async () => {
        const db = getDb();
        const runRows = await db
          .select({ planId: sessionRuns.planId })
          .from(conceptSessionLinks)
          .innerJoin(
            sessionRuns,
            eq(sessionRuns.id, conceptSessionLinks.sessionRunId),
          )
          .where(eq(conceptSessionLinks.conceptId, scopeId))
          .orderBy(desc(conceptSessionLinks.createdAt))
          .limit(1);
        return runRows[0] ?? null;
      }).andThen((run) => {
        if (!run) return okAsync<Array<string>, AppError>([]);
        return chatRepository.getMaterialIdsForScope(
          userId,
          "PLAN",
          run.planId,
        );
      });
    }

    if (scopeType === "SPACE") {
      return tryPromise(async () => {
        const db = getDb();
        const rows = await db
          .select({
            id: spaces.id,
            userId: spaces.userId,
            deletedAt: spaces.deletedAt,
          })
          .from(spaces)
          .where(eq(spaces.id, scopeId))
          .limit(1);
        return rows[0] ?? null;
      }).andThen((space) => {
        if (!space || space.deletedAt) {
          return errAsync(
            new ApiError(404, "SPACE_NOT_FOUND", "Space를 찾을 수 없습니다.", {
              spaceId: scopeId,
            }),
          );
        }

        if (space.userId !== userId) {
          return errAsync(
            new ApiError(
              403,
              "SPACE_ACCESS_DENIED",
              "이 Space에 접근할 수 없습니다.",
              {
                spaceId: scopeId,
              },
            ),
          );
        }

        return tryPromise(() => {
          const db = getDb();
          return db
            .select({ id: materials.id })
            .from(materials)
            .where(
              and(
                eq(materials.userId, userId),
                eq(materials.spaceId, space.id),
                eq(materials.processingStatus, "READY"),
              ),
            )
            .orderBy(desc(materials.createdAt))
            .limit(50);
        }).map((rows) => rows.map((row) => row.id));
      });
    }

    return okAsync<Array<string>, AppError>([]);
  },

  retrieveTopChunks(params: {
    readonly query: string;
    readonly materialIds: ReadonlyArray<string>;
    readonly topK: number;
  }): ResultAsync<
    Array<{
      chunkId: string;
      content: string;
      pageStart: number | null;
      pageEnd: number | null;
      materialTitle: string;
      distance: number;
    }>,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      requireOpenAi();

      if (params.materialIds.length === 0) return [];

      const { vectors } = await embedTexts([params.query]);
      const queryVector = vectors[0];
      if (!queryVector) return [];

      const queryVectorText = vectorLiteral(queryVector);
      const distanceExpr = sql<number>`${materialEmbeddings.vector} <=> ${queryVectorText}::vector`;

      return db
        .select({
          chunkId: materialChunks.id,
          content: materialChunks.content,
          pageStart: materialChunks.pageStart,
          pageEnd: materialChunks.pageEnd,
          materialTitle: materials.title,
          distance: distanceExpr,
        })
        .from(materialChunks)
        .innerJoin(
          materialEmbeddings,
          eq(materialEmbeddings.chunkId, materialChunks.id),
        )
        .innerJoin(materials, eq(materials.id, materialChunks.materialId))
        .where(
          and(
            inArray(materialChunks.materialId, [...params.materialIds]),
            eq(materialEmbeddings.model, CONFIG.OPENAI_EMBEDDING_MODEL),
          ),
        )
        .orderBy(distanceExpr)
        .limit(params.topK);
    });
  },

  findThreadById(
    userId: string,
    threadId: string,
  ): ResultAsync<
    {
      id: string;
      userId: string;
      scopeType: ChatScopeType;
      scopeId: number;
    } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          id: chatThreads.id,
          userId: chatThreads.userId,
          scopeType: chatThreads.scopeType,
          scopeId: chatThreads.scopeId,
        })
        .from(chatThreads)
        .where(eq(chatThreads.id, threadId))
        .limit(1);
      return rows[0] ?? null;
    });
  },

  insertThread(
    data: typeof chatThreads.$inferInsert,
  ): ResultAsync<{ id: string }, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      await db.insert(chatThreads).values(data);
      return { id: data.id ?? "" };
    });
  },

  insertMessage(
    data: typeof chatMessages.$inferInsert,
  ): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      await db.insert(chatMessages).values(data);
    });
  },

  insertCitations(
    rows: Array<typeof chatCitations.$inferInsert>,
  ): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      if (rows.length > 0) {
        await db.insert(chatCitations).values(rows);
      }
    });
  },

  updateThreadUpdatedAt(
    threadId: string,
    updatedAt: Date,
  ): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      await db
        .update(chatThreads)
        .set({ updatedAt })
        .where(eq(chatThreads.id, threadId));
    });
  },

  listMessages(threadId: string): ResultAsync<
    Array<{
      id: string;
      role: string;
      contentMd: string;
      createdAt: Date;
    }>,
    AppError
  > {
    return tryPromise(() => {
      const db = getDb();
      return db
        .select({
          id: chatMessages.id,
          role: chatMessages.role,
          contentMd: chatMessages.contentMd,
          createdAt: chatMessages.createdAt,
        })
        .from(chatMessages)
        .where(eq(chatMessages.threadId, threadId))
        .orderBy(asc(chatMessages.createdAt));
    });
  },

  listCitationsForMessages(messageIds: Array<string>): ResultAsync<
    Array<{
      messageId: string;
      chunkId: string;
      quote: string | null;
      materialTitle: string;
      pageStart: number | null;
      pageEnd: number | null;
    }>,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      if (messageIds.length === 0) return [];

      return db
        .select({
          messageId: chatCitations.messageId,
          chunkId: chatCitations.chunkId,
          quote: chatCitations.quote,
          materialTitle: materials.title,
          pageStart: materialChunks.pageStart,
          pageEnd: materialChunks.pageEnd,
        })
        .from(chatCitations)
        .innerJoin(materialChunks, eq(materialChunks.id, chatCitations.chunkId))
        .innerJoin(materials, eq(materials.id, materialChunks.materialId))
        .where(inArray(chatCitations.messageId, messageIds));
    });
  },
};
