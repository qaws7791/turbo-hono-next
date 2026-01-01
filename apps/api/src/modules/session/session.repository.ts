import {
  conceptSessionLinks,
  concepts,
  planModules,
  planSessions,
  plans,
  sessionProgressSnapshots,
  sessionRuns,
  sessionSummaries,
  spaces,
} from "@repo/database/schema";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";

import { getDb } from "../../lib/db";
import { generatePublicId } from "../../lib/public-id";
import { tryPromise } from "../../lib/result";

import type { AppError } from "../../lib/result";
import type { SessionExitReason, SessionRunStatus } from "./session.dto";
import type { ResultAsync } from "neverthrow";

export const sessionRepository = {
  getHomeQueueRows(
    userId: string,
    today: Date,
  ): ResultAsync<
    Array<{
      sessionId: string;
      sessionTitle: string;
      sessionType: string;
      estimatedMinutes: number;
      status: string;
      planTitle: string;
      spaceName: string;
      moduleTitle: string | null;
    }>,
    AppError
  > {
    return tryPromise(() => {
      const db = getDb();
      return db
        .select({
          sessionId: planSessions.publicId,
          sessionTitle: planSessions.title,
          sessionType: planSessions.sessionType,
          estimatedMinutes: planSessions.estimatedMinutes,
          status: planSessions.status,
          planTitle: plans.title,
          spaceName: spaces.name,
          moduleTitle: planModules.title,
        })
        .from(planSessions)
        .innerJoin(plans, eq(plans.id, planSessions.planId))
        .innerJoin(spaces, eq(spaces.id, plans.spaceId))
        .leftJoin(planModules, eq(planModules.id, planSessions.moduleId))
        .where(
          and(
            eq(plans.userId, userId),
            eq(plans.status, "ACTIVE"),
            isNull(plans.deletedAt),
            eq(planSessions.scheduledForDate, today),
          ),
        )
        .orderBy(asc(spaces.createdAt), asc(planSessions.orderIndex));
    });
  },

  findSessionByPublicId(
    userId: string,
    sessionId: string,
  ): ResultAsync<
    {
      id: number;
      publicId: string;
      status: string;
      planId: number;
      spaceId: number;
    } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          id: planSessions.id,
          publicId: planSessions.publicId,
          status: planSessions.status,
          planId: planSessions.planId,
          spaceId: plans.spaceId,
        })
        .from(planSessions)
        .innerJoin(plans, eq(plans.id, planSessions.planId))
        .where(
          and(
            eq(planSessions.publicId, sessionId),
            eq(plans.userId, userId),
            isNull(plans.deletedAt),
          ),
        )
        .limit(1);
      return rows[0] ?? null;
    });
  },

  findRunningRun(
    userId: string,
    sessionId: number,
  ): ResultAsync<
    { id: number; publicId: string; status: string } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          id: sessionRuns.id,
          publicId: sessionRuns.publicId,
          status: sessionRuns.status,
        })
        .from(sessionRuns)
        .where(
          and(
            eq(sessionRuns.sessionId, sessionId),
            eq(sessionRuns.userId, userId),
            eq(sessionRuns.status, "RUNNING"),
          ),
        )
        .limit(1);
      return rows[0] ?? null;
    });
  },

  findRunByIdempotencyKey(
    userId: string,
    idempotencyKey: string,
  ): ResultAsync<
    {
      id: number;
      publicId: string;
      status: SessionRunStatus;
      sessionId: number;
    } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          id: sessionRuns.id,
          publicId: sessionRuns.publicId,
          status: sessionRuns.status,
          sessionId: sessionRuns.sessionId,
        })
        .from(sessionRuns)
        .where(
          and(
            eq(sessionRuns.userId, userId),
            eq(sessionRuns.idempotencyKey, idempotencyKey),
          ),
        )
        .limit(1);
      return rows[0] ?? null;
    });
  },

  getLastSnapshotStep(runId: number): ResultAsync<number, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({ stepIndex: sessionProgressSnapshots.stepIndex })
        .from(sessionProgressSnapshots)
        .where(eq(sessionProgressSnapshots.sessionRunId, runId))
        .orderBy(desc(sessionProgressSnapshots.createdAt))
        .limit(1);

      return rows[0]?.stepIndex ?? 0;
    });
  },

  findRunByPublicId(
    userId: string,
    runId: string,
  ): ResultAsync<
    { id: number; publicId: string; status: string } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          id: sessionRuns.id,
          publicId: sessionRuns.publicId,
          status: sessionRuns.status,
        })
        .from(sessionRuns)
        .where(
          and(eq(sessionRuns.publicId, runId), eq(sessionRuns.userId, userId)),
        )
        .limit(1);
      return rows[0] ?? null;
    });
  },

  findRunForCompletion(
    userId: string,
    runId: string,
  ): ResultAsync<
    {
      id: number;
      publicId: string;
      status: string;
      sessionId: number;
      planId: number;
      spaceId: number;
      sessionTitle: string;
    } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          id: sessionRuns.id,
          publicId: sessionRuns.publicId,
          status: sessionRuns.status,
          sessionId: sessionRuns.sessionId,
          planId: sessionRuns.planId,
          spaceId: sessionRuns.spaceId,
          sessionTitle: planSessions.title,
        })
        .from(sessionRuns)
        .innerJoin(planSessions, eq(planSessions.id, sessionRuns.sessionId))
        .where(
          and(eq(sessionRuns.publicId, runId), eq(sessionRuns.userId, userId)),
        )
        .limit(1);
      return rows[0] ?? null;
    });
  },

  findRunForAbandon(
    userId: string,
    runId: string,
  ): ResultAsync<
    {
      id: number;
      publicId: string;
      status: string;
      sessionId: number;
    } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          id: sessionRuns.id,
          publicId: sessionRuns.publicId,
          status: sessionRuns.status,
          sessionId: sessionRuns.sessionId,
        })
        .from(sessionRuns)
        .where(
          and(eq(sessionRuns.publicId, runId), eq(sessionRuns.userId, userId)),
        )
        .limit(1);
      return rows[0] ?? null;
    });
  },

  countRemainingSessions(planId: number): ResultAsync<number, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          remaining: sql<number>`sum(case when ${planSessions.status} = 'COMPLETED' then 0 else 1 end)`,
        })
        .from(planSessions)
        .where(eq(planSessions.planId, planId));
      return rows[0]?.remaining ?? 0;
    });
  },

  insertProgressSnapshot(data: {
    sessionRunId: number;
    stepIndex: number;
    payloadJson: Record<string, unknown>;
    createdAt: Date;
  }): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      await db.insert(sessionProgressSnapshots).values({
        id: crypto.randomUUID(),
        sessionRunId: data.sessionRunId,
        stepIndex: data.stepIndex,
        payloadJson: data.payloadJson,
        createdAt: data.createdAt,
      });
    });
  },

  createRunWithSessionUpdate(params: {
    session: {
      id: number;
      publicId: string;
      planId: number;
      spaceId: number;
    };
    userId: string;
    now: Date;
    idempotencyKey?: string;
  }): ResultAsync<{ publicId: string }, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const runPublicId = generatePublicId();

      await db.transaction(async (tx) => {
        await tx.insert(sessionRuns).values({
          publicId: runPublicId,
          sessionId: params.session.id,
          userId: params.userId,
          spaceId: params.session.spaceId,
          planId: params.session.planId,
          idempotencyKey: params.idempotencyKey ?? null,
          status: "RUNNING",
          startedAt: params.now,
          createdAt: params.now,
        });

        await tx
          .update(planSessions)
          .set({ status: "IN_PROGRESS", updatedAt: params.now })
          .where(eq(planSessions.id, params.session.id));
      });

      return { publicId: runPublicId };
    });
  },

  completeRunTransaction(params: {
    run: {
      id: number;
      publicId: string;
      sessionId: number;
      planId: number;
      spaceId: number;
    };
    userId: string;
    conceptTitle: string;
    now: Date;
  }): ResultAsync<
    {
      conceptsCreated: number;
      conceptsUpdated: number;
      summaryId: string;
    },
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const summaryId = crypto.randomUUID();
      let conceptsCreated = 0;
      let conceptsUpdated = 0;

      await db.transaction(async (tx) => {
        const existingConcept = await tx
          .select({ id: concepts.id })
          .from(concepts)
          .where(
            and(
              eq(concepts.userId, params.userId),
              eq(concepts.spaceId, params.run.spaceId),
              eq(concepts.title, params.conceptTitle),
              isNull(concepts.deletedAt),
            ),
          )
          .limit(1);

        const createdAt = params.now;
        const tomorrow = new Date(params.now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        let conceptId = existingConcept[0]?.id ?? null;

        if (!conceptId) {
          conceptsCreated = 1;
          const insertedConceptRows = await tx
            .insert(concepts)
            .values({
              publicId: generatePublicId(),
              userId: params.userId,
              spaceId: params.run.spaceId,
              title: params.conceptTitle,
              oneLiner: "학습 세션에서 생성된 개념",
              ariNoteMd: `## ${params.conceptTitle}\n\n세션 완료 시 자동으로 생성된 개념입니다.`,
              lastLearnedAt: params.now,
              srsDueAt: tomorrow,
              srsStateJson: { interval: 1, ease: 2.5 },
              createdAt,
              updatedAt: createdAt,
            })
            .returning({ id: concepts.id });

          const insertedConcept = insertedConceptRows[0];
          if (!insertedConcept) {
            throw new Error("Concept 생성에 실패했습니다.");
          }

          conceptId = insertedConcept.id;

          await tx.insert(conceptSessionLinks).values({
            conceptId,
            sessionRunId: params.run.id,
            linkType: "CREATED",
            createdAt,
          });
        } else {
          conceptsUpdated = 1;
          await tx
            .update(concepts)
            .set({ lastLearnedAt: params.now, updatedAt: params.now })
            .where(eq(concepts.id, conceptId));

          await tx.insert(conceptSessionLinks).values({
            conceptId,
            sessionRunId: params.run.id,
            linkType: "UPDATED",
            createdAt,
          });
        }

        await tx
          .update(sessionRuns)
          .set({ status: "COMPLETED", endedAt: params.now })
          .where(eq(sessionRuns.id, params.run.id));

        await tx
          .update(planSessions)
          .set({
            status: "COMPLETED",
            completedAt: params.now,
            updatedAt: params.now,
          })
          .where(eq(planSessions.id, params.run.sessionId));

        await tx.insert(sessionSummaries).values({
          id: summaryId,
          sessionRunId: params.run.id,
          summaryMd: "세션이 완료되었습니다.",
          conceptsCreatedCount: conceptsCreated,
          conceptsUpdatedCount: conceptsUpdated,
          reviewsScheduledCount: 0,
          createdAt: params.now,
        });
      });

      return { conceptsCreated, conceptsUpdated, summaryId };
    });
  },

  abandonRunTransaction(params: {
    run: { id: number; sessionId: number };
    reason: SessionExitReason;
    now: Date;
  }): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();

      await db.transaction(async (tx) => {
        await tx
          .update(sessionRuns)
          .set({
            status: "ABANDONED",
            endedAt: params.now,
            exitReason: params.reason,
          })
          .where(eq(sessionRuns.id, params.run.id));

        await tx
          .update(planSessions)
          .set({ status: "SCHEDULED", updatedAt: params.now })
          .where(eq(planSessions.id, params.run.sessionId));
      });
    });
  },

  markPlanCompleted(planId: number, now: Date): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      await db
        .update(plans)
        .set({ status: "COMPLETED", completedAt: now, updatedAt: now })
        .where(eq(plans.id, planId));
    });
  },
};
