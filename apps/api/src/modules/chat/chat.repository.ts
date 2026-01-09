import {
  chatMessages,
  chatThreads,
  materials,
  planSessions,
  planSourceMaterials,
  plans,
} from "@repo/database/schema";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { errAsync, okAsync } from "neverthrow";

import { retrieveTopChunks as ragRetrieveTopChunks } from "../../ai/rag/retrieve";
import { getDb } from "../../lib/db";
import { tryPromise } from "../../lib/result";
import { ApiError } from "../../middleware/error-handler";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../lib/result";
import type { ChatScopeType } from "./chat.dto";

export const chatRepository = {
  getScopeInfo(
    userId: string,
    scopeType: ChatScopeType,
    scopeId: string,
  ): ResultAsync<{ scopeId: number }, AppError> {
    if (scopeType === "PLAN") {
      return tryPromise(async () => {
        const db = getDb();
        const rows = await db
          .select({ id: plans.id })
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
        return okAsync({ scopeId: plan.id });
      });
    }

    if (scopeType === "SESSION") {
      return tryPromise(async () => {
        const db = getDb();
        const rows = await db
          .select({ id: planSessions.id })
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
        return okAsync({ scopeId: session.id });
      });
    }

    return errAsync(
      new ApiError(400, "INVALID_SCOPE", "유효하지 않은 채팅 범위입니다."),
    );
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

    return okAsync<Array<string>, AppError>([]);
  },

  getMaterialIdsForUser(userId: string): ResultAsync<Array<string>, AppError> {
    return tryPromise(() => {
      const db = getDb();
      return db
        .select({ id: materials.id })
        .from(materials)
        .where(
          and(
            eq(materials.userId, userId),
            eq(materials.processingStatus, "READY"),
            isNull(materials.deletedAt),
          ),
        )
        .orderBy(desc(materials.createdAt))
        .limit(50);
    }).map((rows) => rows.map((row) => row.id));
  },

  retrieveTopChunks(params: {
    readonly userId: string;
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
      const rows = await ragRetrieveTopChunks({
        userId: params.userId,
        materialIds: params.materialIds,
        query: params.query,
        topK: params.topK,
      });

      return rows.map((row) => ({
        chunkId: row.documentId,
        content: row.content,
        pageStart: row.metadata.pageNumber ?? null,
        pageEnd: row.metadata.pageNumber ?? null,
        materialTitle: row.metadata.materialTitle,
        distance: row.distance,
      }));
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
      scopeId: string;
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
      metadataJson: Record<string, unknown> | null;
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
          metadataJson: chatMessages.metadataJson,
          createdAt: chatMessages.createdAt,
        })
        .from(chatMessages)
        .where(eq(chatMessages.threadId, threadId))
        .orderBy(asc(chatMessages.createdAt));
    });
  },
};
