import {
  planModules,
  planSessions,
  planSourceMaterials,
  plans,
  sessionActivities,
  sessionCheckins,
  sessionProgressSnapshots,
  sessionRunBlueprints,
  sessionRuns,
  sessionSummaries,
} from "@repo/database/schema";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";

import { generatePublicId } from "../../../../common/public-id";
import { coreError } from "../../../../common/core-error";
import { tryPromise } from "../../../../common/result";

import type { Database } from "@repo/database";
import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type {
  PlanSessionStatus,
  PlanSessionType,
  SessionActivityKind,
  SessionCheckinKind,
  SessionExitReason,
  SessionRunStatus,
  SessionSourceReference,
} from "../../api/schema";

export function createSessionRepository(db: Database) {
  return {
    getHomeQueueRows(
      userId: string,
      today: Date,
    ): ResultAsync<
      Array<{
        sessionId: string;
        planId: string;
        sessionTitle: string;
        sessionType: PlanSessionType;
        estimatedMinutes: number;
        status: PlanSessionStatus;
        planTitle: string;
        planIcon: string;
        planColor: string;
        moduleTitle: string;
      }>,
      AppError
    > {
      return tryPromise(() => {
        return db
          .select({
            sessionId: planSessions.publicId,
            planId: plans.publicId,
            sessionTitle: planSessions.title,
            sessionType: planSessions.sessionType,
            estimatedMinutes: planSessions.estimatedMinutes,
            status: planSessions.status,
            planTitle: plans.title,
            planIcon: plans.icon,
            planColor: plans.color,
            moduleTitle: planModules.title,
          })
          .from(planSessions)
          .innerJoin(plans, eq(plans.id, planSessions.planId))
          .innerJoin(planModules, eq(planModules.id, planSessions.moduleId))
          .where(
            and(
              eq(plans.userId, userId),
              eq(plans.status, "ACTIVE"),
              isNull(plans.deletedAt),
              eq(planSessions.scheduledForDate, today),
            ),
          )
          .orderBy(asc(plans.createdAt), asc(planSessions.orderIndex));
      });
    },

    listPlanSourceMaterialIds(
      planId: number,
    ): ResultAsync<Array<string>, AppError> {
      return tryPromise(async () => {
        const rows = await db
          .select({ materialId: planSourceMaterials.materialId })
          .from(planSourceMaterials)
          .where(eq(planSourceMaterials.planId, planId))
          .orderBy(asc(planSourceMaterials.orderIndex));

        return rows.map((row) => row.materialId);
      });
    },

    findRunBlueprint(runId: number): ResultAsync<
      {
        schemaVersion: number;
        blueprintJson: Record<string, unknown>;
        createdAt: Date;
      } | null,
      AppError
    > {
      return tryPromise(async () => {
        const rows = await db
          .select({
            schemaVersion: sessionRunBlueprints.schemaVersion,
            blueprintJson: sessionRunBlueprints.blueprintJson,
            createdAt: sessionRunBlueprints.createdAt,
          })
          .from(sessionRunBlueprints)
          .where(eq(sessionRunBlueprints.sessionRunId, runId))
          .limit(1);

        return rows[0] ?? null;
      });
    },

    upsertRunBlueprint(params: {
      runId: number;
      schemaVersion: number;
      blueprintJson: Record<string, unknown>;
      createdAt: Date;
    }): ResultAsync<void, AppError> {
      return tryPromise(async () => {
        await db
          .insert(sessionRunBlueprints)
          .values({
            sessionRunId: params.runId,
            schemaVersion: params.schemaVersion,
            blueprintJson: params.blueprintJson,
            createdAt: params.createdAt,
          })
          .onConflictDoUpdate({
            target: sessionRunBlueprints.sessionRunId,
            set: {
              schemaVersion: params.schemaVersion,
              blueprintJson: params.blueprintJson,
              createdAt: params.createdAt,
            },
          });
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
      } | null,
      AppError
    > {
      return tryPromise(async () => {
        const rows = await db
          .select({
            id: planSessions.id,
            publicId: planSessions.publicId,
            status: planSessions.status,
            planId: planSessions.planId,
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
      {
        id: number;
        publicId: string;
        status: SessionRunStatus;
      } | null,
      AppError
    > {
      return tryPromise(async () => {
        const rows = await db
          .select({
            id: sessionRuns.id,
            publicId: sessionRuns.publicId,
            status: sessionRuns.status,
          })
          .from(sessionRuns)
          .where(
            and(
              eq(sessionRuns.userId, userId),
              eq(sessionRuns.sessionId, sessionId),
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
        sessionId: number;
        status: SessionRunStatus;
      } | null,
      AppError
    > {
      return tryPromise(async () => {
        const rows = await db
          .select({
            id: sessionRuns.id,
            publicId: sessionRuns.publicId,
            sessionId: sessionRuns.sessionId,
            status: sessionRuns.status,
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
        const rows = await db
          .select({ stepIndex: sessionProgressSnapshots.stepIndex })
          .from(sessionProgressSnapshots)
          .where(eq(sessionProgressSnapshots.sessionRunId, runId))
          .orderBy(desc(sessionProgressSnapshots.createdAt))
          .limit(1);

        return rows[0]?.stepIndex ?? 0;
      });
    },

    getLastProgressSnapshot(runId: number): ResultAsync<
      {
        stepIndex: number;
        payloadJson: Record<string, unknown>;
        createdAt: Date;
      } | null,
      AppError
    > {
      return tryPromise(async () => {
        const rows = await db
          .select({
            stepIndex: sessionProgressSnapshots.stepIndex,
            payloadJson: sessionProgressSnapshots.payloadJson,
            createdAt: sessionProgressSnapshots.createdAt,
          })
          .from(sessionProgressSnapshots)
          .where(eq(sessionProgressSnapshots.sessionRunId, runId))
          .orderBy(desc(sessionProgressSnapshots.createdAt))
          .limit(1);

        return rows[0] ?? null;
      });
    },

    findRunDetail(
      userId: string,
      runPublicId: string,
    ): ResultAsync<
      {
        run: {
          id: number;
          publicId: string;
          status: SessionRunStatus;
          startedAt: Date;
          endedAt: Date | null;
          exitReason: SessionExitReason | null;
        };
        plan: {
          id: number;
          publicId: string;
          title: string;
          icon: string;
          color: string;
        };
        session: {
          id: number;
          publicId: string;
          title: string;
          objective: string | null;
          sessionType: string;
          estimatedMinutes: number;
          sourceReferences: ReadonlyArray<{
            materialId: string;
            chunkRange: { start: number; end: number };
          }> | null;
        };
        module: {
          id: string;
          title: string;
        } | null;
        summary: {
          id: string;
          summaryMd: string;
          createdAt: Date;
        } | null;
      } | null,
      AppError
    > {
      return tryPromise(async () => {
        const rows = await db
          .select({
            run: {
              id: sessionRuns.id,
              publicId: sessionRuns.publicId,
              status: sessionRuns.status,
              startedAt: sessionRuns.startedAt,
              endedAt: sessionRuns.endedAt,
              exitReason: sessionRuns.exitReason,
            },
            plan: {
              id: plans.id,
              publicId: plans.publicId,
              title: plans.title,
              icon: plans.icon,
              color: plans.color,
            },
            session: {
              id: planSessions.id,
              publicId: planSessions.publicId,
              title: planSessions.title,
              objective: planSessions.objective,
              sessionType: planSessions.sessionType,
              estimatedMinutes: planSessions.estimatedMinutes,
              sourceReferences: planSessions.sourceReferences,
            },
            module: {
              id: planModules.id,
              title: planModules.title,
            },
            summary: {
              id: sessionSummaries.id,
              summaryMd: sessionSummaries.summaryMd,
              createdAt: sessionSummaries.createdAt,
            },
          })
          .from(sessionRuns)
          .innerJoin(plans, eq(plans.id, sessionRuns.planId))
          .innerJoin(planSessions, eq(planSessions.id, sessionRuns.sessionId))
          .leftJoin(planModules, eq(planModules.id, planSessions.moduleId))
          .leftJoin(
            sessionSummaries,
            eq(sessionSummaries.sessionRunId, sessionRuns.id),
          )
          .where(
            and(
              eq(sessionRuns.userId, userId),
              eq(sessionRuns.publicId, runPublicId),
            ),
          )
          .limit(1);

        const row = rows[0];
        if (!row) return null;

        const module = row.module?.id
          ? { id: row.module.id, title: row.module.title }
          : null;

        const summary = row.summary?.id
          ? {
              id: row.summary.id,
              summaryMd: row.summary.summaryMd,
              createdAt: row.summary.createdAt,
            }
          : null;

        const refs = row.session
          .sourceReferences as unknown as ReadonlyArray<SessionSourceReference> | null;

        return {
          run: row.run,
          plan: row.plan,
          session: { ...row.session, sourceReferences: refs },
          module,
          summary,
        };
      });
    },

    updatePlanSession(params: {
      userId: string;
      sessionPublicId: string;
      status?: PlanSessionStatus;
      scheduledForDate?: Date;
      completedAt?: Date | null;
      now: Date;
    }): ResultAsync<
      { sessionId: string; status: PlanSessionStatus; scheduledForDate: Date },
      AppError
    > {
      return tryPromise(async () => {
        const rows = await db
          .update(planSessions)
          .set({
            ...(params.status ? { status: params.status } : {}),
            ...(params.scheduledForDate
              ? { scheduledForDate: params.scheduledForDate }
              : {}),
            ...(params.completedAt !== undefined
              ? { completedAt: params.completedAt }
              : {}),
            updatedAt: params.now,
          })
          .from(plans)
          .where(
            and(
              eq(planSessions.planId, plans.id),
              eq(plans.userId, params.userId),
              eq(planSessions.publicId, params.sessionPublicId),
            ),
          )
          .returning({
            sessionId: planSessions.publicId,
            status: planSessions.status,
            scheduledForDate: planSessions.scheduledForDate,
          });

        return rows[0]!;
      });
    },

    insertProgressSnapshot(params: {
      userId: string;
      runId: string;
      stepIndex: number;
      payloadJson: Record<string, unknown>;
      createdAt: Date;
    }): ResultAsync<{ runId: string; savedAt: Date }, AppError> {
      return tryPromise(async () => {
        const run = await db
          .select({
            id: sessionRuns.id,
            publicId: sessionRuns.publicId,
            status: sessionRuns.status,
          })
          .from(sessionRuns)
          .where(
            and(
              eq(sessionRuns.userId, params.userId),
              eq(sessionRuns.publicId, params.runId),
            ),
          )
          .limit(1)
          .then((rows) => rows[0] ?? null);

        if (!run) {
          throw coreError({
            code: "SESSION_NOT_FOUND",
            message: "세션을 찾을 수 없습니다.",
            details: { runId: params.runId },
          });
        }

        if (run.status !== "RUNNING") {
          throw coreError({
            code: "INVALID_REQUEST",
            message: "진행 중인 세션이 아닙니다.",
            details: { status: run.status },
          });
        }

        await db.insert(sessionProgressSnapshots).values({
          id: crypto.randomUUID(),
          sessionRunId: run.id,
          stepIndex: params.stepIndex,
          payloadJson: params.payloadJson,
          createdAt: params.createdAt,
        });

        return { runId: run.publicId, savedAt: params.createdAt };
      });
    },

    createRunWithSessionUpdate(params: {
      session: {
        id: number;
        publicId: string;
        planId: number;
      };
      userId: string;
      now: Date;
      idempotencyKey?: string;
    }): ResultAsync<{ publicId: string }, AppError> {
      return tryPromise(async () => {
        const runPublicId = generatePublicId();

        await db.transaction(async (tx) => {
          await tx.insert(sessionRuns).values({
            publicId: runPublicId,
            sessionId: params.session.id,
            userId: params.userId,
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
        startedAt: Date;
      };
      userId: string;
      now: Date;
    }): ResultAsync<
      {
        summaryId: string;
      },
      AppError
    > {
      return tryPromise(async () => {
        const summaryId = crypto.randomUUID();

        const durationMinutes = Math.max(
          0,
          Math.round(
            (params.now.getTime() - params.run.startedAt.getTime()) / 60_000,
          ),
        );

        await db.transaction(async (tx) => {
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

          const summaryMd = [
            `# 세션 완료`,
            "",
            `- 학습 시간: ${durationMinutes}분`,
            "",
            "세션이 완료되었습니다.",
          ].join("\n");

          await tx.insert(sessionSummaries).values({
            id: summaryId,
            sessionRunId: params.run.id,
            summaryMd,
            createdAt: params.now,
          });
        });

        return { summaryId };
      });
    },

    abandonRunTransaction(params: {
      run: { id: number; sessionId: number };
      reason: SessionExitReason;
      now: Date;
    }): ResultAsync<void, AppError> {
      return tryPromise(async () => {
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
        await db
          .update(plans)
          .set({ status: "COMPLETED", completedAt: now, updatedAt: now })
          .where(eq(plans.id, planId));
      });
    },

    countSessionRuns(
      userId: string,
      filter: { status?: SessionRunStatus },
    ): ResultAsync<number, AppError> {
      return tryPromise(async () => {
        const where = [eq(sessionRuns.userId, userId)];
        if (filter.status) where.push(eq(sessionRuns.status, filter.status));

        const rows = await db
          .select({ total: sql<number>`count(*)`.mapWith(Number) })
          .from(sessionRuns)
          .where(and(...where));

        return rows[0]?.total ?? 0;
      });
    },

    listSessionRuns(
      userId: string,
      input: { page: number; limit: number; status?: SessionRunStatus },
    ): ResultAsync<
      Array<{
        runId: string;
        status: SessionRunStatus;
        startedAt: Date;
        endedAt: Date | null;
        exitReason: SessionExitReason | null;
        sessionId: string;
        sessionTitle: string;
        sessionType: PlanSessionType;
        planId: string;
        planTitle: string;
        planIcon: string;
        planColor: string;
        summary: { id: string; createdAt: Date } | null;
      }>,
      AppError
    > {
      return tryPromise(async () => {
        const offset = (input.page - 1) * input.limit;

        const where = [eq(sessionRuns.userId, userId)];
        if (input.status) where.push(eq(sessionRuns.status, input.status));

        const rows = await db
          .select({
            runId: sessionRuns.publicId,
            status: sessionRuns.status,
            startedAt: sessionRuns.startedAt,
            endedAt: sessionRuns.endedAt,
            exitReason: sessionRuns.exitReason,
            sessionId: planSessions.publicId,
            sessionTitle: planSessions.title,
            sessionType: planSessions.sessionType,
            planId: plans.publicId,
            planTitle: plans.title,
            planIcon: plans.icon,
            planColor: plans.color,
            summaryId: sessionSummaries.id,
            summaryCreatedAt: sessionSummaries.createdAt,
          })
          .from(sessionRuns)
          .innerJoin(plans, eq(plans.id, sessionRuns.planId))
          .innerJoin(planSessions, eq(planSessions.id, sessionRuns.sessionId))
          .leftJoin(
            sessionSummaries,
            eq(sessionSummaries.sessionRunId, sessionRuns.id),
          )
          .where(and(...where))
          .orderBy(desc(sessionRuns.createdAt))
          .limit(input.limit)
          .offset(offset);

        return rows.map((row) => ({
          runId: row.runId,
          status: row.status,
          startedAt: row.startedAt,
          endedAt: row.endedAt,
          exitReason: row.exitReason,
          sessionId: row.sessionId,
          sessionTitle: row.sessionTitle,
          sessionType: row.sessionType,
          planId: row.planId,
          planTitle: row.planTitle,
          planIcon: row.planIcon,
          planColor: row.planColor,
          summary:
            row.summaryId && row.summaryCreatedAt
              ? { id: row.summaryId, createdAt: row.summaryCreatedAt }
              : null,
        }));
      });
    },

    listRunCheckins(
      userId: string,
      runId: string,
    ): ResultAsync<
      Array<{
        id: string;
        kind: SessionCheckinKind;
        prompt: string;
        responseJson: Record<string, unknown> | null;
        recordedAt: Date;
      }>,
      AppError
    > {
      return tryPromise(async () => {
        const run = await db
          .select({ id: sessionRuns.id })
          .from(sessionRuns)
          .where(
            and(
              eq(sessionRuns.userId, userId),
              eq(sessionRuns.publicId, runId),
            ),
          )
          .limit(1)
          .then((rows) => rows[0] ?? null);

        if (!run) {
          throw coreError({
            code: "SESSION_NOT_FOUND",
            message: "세션을 찾을 수 없습니다.",
            details: { runId },
          });
        }

        return db
          .select({
            id: sessionCheckins.id,
            kind: sessionCheckins.kind,
            prompt: sessionCheckins.prompt,
            responseJson: sessionCheckins.responseJson,
            recordedAt: sessionCheckins.recordedAt,
          })
          .from(sessionCheckins)
          .where(eq(sessionCheckins.sessionRunId, run.id))
          .orderBy(asc(sessionCheckins.recordedAt));
      });
    },

    createRunCheckin(params: {
      userId: string;
      runId: string;
      kind: SessionCheckinKind;
      prompt: string;
      responseJson?: Record<string, unknown>;
      recordedAt: Date;
    }): ResultAsync<{ id: string; recordedAt: Date }, AppError> {
      return tryPromise(async () => {
        const run = await db
          .select({ id: sessionRuns.id, status: sessionRuns.status })
          .from(sessionRuns)
          .where(
            and(
              eq(sessionRuns.userId, params.userId),
              eq(sessionRuns.publicId, params.runId),
            ),
          )
          .limit(1)
          .then((rows) => rows[0] ?? null);

        if (!run) {
          throw coreError({
            code: "SESSION_NOT_FOUND",
            message: "세션을 찾을 수 없습니다.",
            details: { runId: params.runId },
          });
        }

        if (run.status !== "RUNNING") {
          throw coreError({
            code: "INVALID_REQUEST",
            message: "진행 중인 세션이 아닙니다.",
            details: { status: run.status },
          });
        }

        const id = crypto.randomUUID();
        await db.insert(sessionCheckins).values({
          id,
          sessionRunId: run.id,
          kind: params.kind,
          prompt: params.prompt,
          responseJson: params.responseJson ?? null,
          recordedAt: params.recordedAt,
        });

        return { id, recordedAt: params.recordedAt };
      });
    },

    listRunActivities(
      userId: string,
      runId: string,
    ): ResultAsync<
      Array<{
        id: string;
        kind: SessionActivityKind;
        prompt: string;
        userAnswer: string | null;
        aiEvalJson: Record<string, unknown> | null;
        createdAt: Date;
      }>,
      AppError
    > {
      return tryPromise(async () => {
        const run = await db
          .select({ id: sessionRuns.id })
          .from(sessionRuns)
          .where(
            and(
              eq(sessionRuns.userId, userId),
              eq(sessionRuns.publicId, runId),
            ),
          )
          .limit(1)
          .then((rows) => rows[0] ?? null);

        if (!run) {
          throw coreError({
            code: "SESSION_NOT_FOUND",
            message: "세션을 찾을 수 없습니다.",
            details: { runId },
          });
        }

        return db
          .select({
            id: sessionActivities.id,
            kind: sessionActivities.kind,
            prompt: sessionActivities.prompt,
            userAnswer: sessionActivities.userAnswer,
            aiEvalJson: sessionActivities.aiEvalJson,
            createdAt: sessionActivities.createdAt,
          })
          .from(sessionActivities)
          .where(eq(sessionActivities.sessionRunId, run.id))
          .orderBy(asc(sessionActivities.createdAt));
      });
    },

    createRunActivity(params: {
      userId: string;
      runId: string;
      kind: SessionActivityKind;
      prompt: string;
      userAnswer?: string;
      aiEvalJson?: Record<string, unknown>;
      createdAt: Date;
    }): ResultAsync<{ id: string; createdAt: Date }, AppError> {
      return tryPromise(async () => {
        const run = await db
          .select({ id: sessionRuns.id, status: sessionRuns.status })
          .from(sessionRuns)
          .where(
            and(
              eq(sessionRuns.userId, params.userId),
              eq(sessionRuns.publicId, params.runId),
            ),
          )
          .limit(1)
          .then((rows) => rows[0] ?? null);

        if (!run) {
          throw coreError({
            code: "SESSION_NOT_FOUND",
            message: "세션을 찾을 수 없습니다.",
            details: { runId: params.runId },
          });
        }

        if (run.status !== "RUNNING") {
          throw coreError({
            code: "INVALID_REQUEST",
            message: "진행 중인 세션이 아닙니다.",
            details: { status: run.status },
          });
        }

        const id = crypto.randomUUID();
        await db.insert(sessionActivities).values({
          id,
          sessionRunId: run.id,
          kind: params.kind,
          prompt: params.prompt,
          userAnswer: params.userAnswer ?? null,
          aiEvalJson: params.aiEvalJson ?? null,
          createdAt: params.createdAt,
        });

        return { id, createdAt: params.createdAt };
      });
    },

    findRunByPublicId(
      userId: string,
      runId: string,
    ): ResultAsync<
      {
        id: number;
        publicId: string;
        status: SessionRunStatus;
        sessionId: number;
        planId: number;
        startedAt: Date;
      } | null,
      AppError
    > {
      return tryPromise(async () => {
        const rows = await db
          .select({
            id: sessionRuns.id,
            publicId: sessionRuns.publicId,
            status: sessionRuns.status,
            sessionId: sessionRuns.sessionId,
            planId: sessionRuns.planId,
            startedAt: sessionRuns.startedAt,
          })
          .from(sessionRuns)
          .where(
            and(
              eq(sessionRuns.userId, userId),
              eq(sessionRuns.publicId, runId),
            ),
          )
          .limit(1);

        return rows[0] ?? null;
      });
    },

    listDistinctStudyDates(
      userId: string,
      maxDays: number,
    ): ResultAsync<Array<Date>, AppError> {
      return tryPromise(async () => {
        const rows = await db
          .selectDistinct({
            studyDate: sql<string>`date(${sessionRuns.endedAt})`,
          })
          .from(sessionRuns)
          .where(
            and(
              eq(sessionRuns.userId, userId),
              eq(sessionRuns.status, "COMPLETED"),
            ),
          )
          .orderBy(desc(sql`date(${sessionRuns.endedAt})`))
          .limit(maxDays);

        return rows
          .map((r) => r.studyDate)
          .filter((d): d is string => d !== null)
          .map((d) => new Date(`${d}T00:00:00Z`));
      });
    },

    countRemainingSessions(planId: number): ResultAsync<number, AppError> {
      return tryPromise(async () => {
        const rows = await db
          .select({
            remaining: sql<number>`sum(case when ${planSessions.status} in ('COMPLETED', 'SKIPPED', 'CANCELED') then 0 else 1 end)`,
          })
          .from(planSessions)
          .where(eq(planSessions.planId, planId));
        return rows[0]?.remaining ?? 0;
      });
    },
  };
}

export type SessionRepository = ReturnType<typeof createSessionRepository>;
