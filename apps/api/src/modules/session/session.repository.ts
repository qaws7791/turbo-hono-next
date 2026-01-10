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

import { getDb } from "../../lib/db";
import { generatePublicId } from "../../lib/public-id";
import { tryPromise } from "../../lib/result";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../lib/result";
import type {
  PlanSessionStatus,
  PlanSessionType,
  SessionActivityKind,
  SessionCheckinKind,
  SessionExitReason,
  SessionRunStatus,
} from "./session.dto";

export const sessionRepository = {
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
      moduleTitle: string | null;
    }>,
    AppError
  > {
    return tryPromise(() => {
      const db = getDb();
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
        .leftJoin(planModules, eq(planModules.id, planSessions.moduleId))
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
      const db = getDb();
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
      const db = getDb();
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
      const db = getDb();
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
      const db = getDb();
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

  findSessionForUpdate(
    userId: string,
    sessionId: string,
  ): ResultAsync<
    {
      internalId: number;
      publicId: string;
      status: PlanSessionStatus;
      scheduledForDate: Date;
    } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          internalId: planSessions.id,
          publicId: planSessions.publicId,
          status: planSessions.status,
          scheduledForDate: planSessions.scheduledForDate,
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

  updatePlanSession(params: {
    sessionInternalId: number;
    status?: PlanSessionStatus;
    scheduledForDate?: Date;
    completedAt?: Date | null;
    now: Date;
  }): ResultAsync<
    { publicId: string; status: PlanSessionStatus; scheduledForDate: Date },
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const patch: Partial<typeof planSessions.$inferInsert> = {
        updatedAt: params.now,
      };

      if (params.status !== undefined) {
        patch.status = params.status;
      }
      if (params.scheduledForDate !== undefined) {
        patch.scheduledForDate = params.scheduledForDate;
      }
      if (params.completedAt !== undefined) {
        patch.completedAt = params.completedAt;
      }

      const rows = await db
        .update(planSessions)
        .set(patch)
        .where(eq(planSessions.id, params.sessionInternalId))
        .returning({
          publicId: planSessions.publicId,
          status: planSessions.status,
          scheduledForDate: planSessions.scheduledForDate,
        });

      const updated = rows[0];
      if (!updated) {
        throw new Error("Session 업데이트에 실패했습니다.");
      }

      return updated;
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
      startedAt: Date;
      sessionId: number;
      planId: number;
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
          startedAt: sessionRuns.startedAt,
          sessionId: sessionRuns.sessionId,
          planId: sessionRuns.planId,
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

  findRunDetail(
    userId: string,
    runId: string,
  ): ResultAsync<
    {
      run: {
        id: number;
        publicId: string;
        status: string;
        startedAt: Date;
        endedAt: Date | null;
        exitReason: SessionExitReason | null;
      };
      session: {
        publicId: string;
        title: string;
        objective: string | null;
        sessionType: string;
        estimatedMinutes: number;
      };
      module: { id: string; title: string } | null;
      plan: {
        id: number;
        publicId: string;
        title: string;
        icon: string;
        color: string;
      };
      summary: {
        id: string;
        summaryMd: string;
        createdAt: Date;
      } | null;
    } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
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
          session: {
            publicId: planSessions.publicId,
            title: planSessions.title,
            objective: planSessions.objective,
            sessionType: planSessions.sessionType,
            estimatedMinutes: planSessions.estimatedMinutes,
          },
          module: {
            id: planModules.id,
            title: planModules.title,
          },
          plan: {
            id: plans.id,
            publicId: plans.publicId,
            title: plans.title,
            icon: plans.icon,
            color: plans.color,
          },
          summary: {
            id: sessionSummaries.id,
            summaryMd: sessionSummaries.summaryMd,
            createdAt: sessionSummaries.createdAt,
          },
        })
        .from(sessionRuns)
        .innerJoin(planSessions, eq(planSessions.id, sessionRuns.sessionId))
        .innerJoin(plans, eq(plans.id, sessionRuns.planId))
        .leftJoin(planModules, eq(planModules.id, planSessions.moduleId))
        .leftJoin(
          sessionSummaries,
          eq(sessionSummaries.sessionRunId, sessionRuns.id),
        )
        .where(
          and(eq(sessionRuns.publicId, runId), eq(sessionRuns.userId, userId)),
        )
        .limit(1);

      const row = rows[0];
      if (!row) return null;

      return {
        run: {
          ...row.run,
          endedAt: row.run.endedAt ?? null,
          exitReason: row.run.exitReason ?? null,
        },
        session: row.session,
        module: row.module && row.module.id ? row.module : null,
        plan: row.plan,
        summary: row.summary && row.summary.id ? row.summary : null,
      };
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
      const db = getDb();
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

  insertCheckin(data: {
    sessionRunId: number;
    kind: SessionCheckinKind;
    prompt: string;
    responseJson: Record<string, unknown> | null;
    recordedAt: Date;
  }): ResultAsync<{ id: string }, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const id = crypto.randomUUID();
      await db.insert(sessionCheckins).values({
        id,
        sessionRunId: data.sessionRunId,
        kind: data.kind,
        prompt: data.prompt,
        responseJson: data.responseJson,
        recordedAt: data.recordedAt,
      });
      return { id };
    });
  },

  listCheckins(runId: number): ResultAsync<
    Array<{
      id: string;
      kind: string;
      prompt: string;
      responseJson: Record<string, unknown> | null;
      recordedAt: Date;
    }>,
    AppError
  > {
    return tryPromise(() => {
      const db = getDb();
      return db
        .select({
          id: sessionCheckins.id,
          kind: sessionCheckins.kind,
          prompt: sessionCheckins.prompt,
          responseJson: sessionCheckins.responseJson,
          recordedAt: sessionCheckins.recordedAt,
        })
        .from(sessionCheckins)
        .where(eq(sessionCheckins.sessionRunId, runId))
        .orderBy(desc(sessionCheckins.recordedAt))
        .limit(200);
    });
  },

  insertActivity(data: {
    sessionRunId: number;
    kind: SessionActivityKind;
    prompt: string;
    userAnswer: string | null;
    aiEvalJson: Record<string, unknown> | null;
    createdAt: Date;
  }): ResultAsync<{ id: string }, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const id = crypto.randomUUID();
      await db.insert(sessionActivities).values({
        id,
        sessionRunId: data.sessionRunId,
        kind: data.kind,
        prompt: data.prompt,
        userAnswer: data.userAnswer,
        aiEvalJson: data.aiEvalJson,
        createdAt: data.createdAt,
      });
      return { id };
    });
  },

  listActivities(runId: number): ResultAsync<
    Array<{
      id: string;
      kind: string;
      prompt: string;
      userAnswer: string | null;
      aiEvalJson: Record<string, unknown> | null;
      createdAt: Date;
    }>,
    AppError
  > {
    return tryPromise(() => {
      const db = getDb();
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
        .where(eq(sessionActivities.sessionRunId, runId))
        .orderBy(desc(sessionActivities.createdAt))
        .limit(500);
    });
  },

  countSessionRuns(
    userId: string,
    input?: { status?: SessionRunStatus },
  ): ResultAsync<number, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const where = [eq(sessionRuns.userId, userId), isNull(plans.deletedAt)];

      if (input?.status) {
        where.push(eq(sessionRuns.status, input.status));
      }

      const rows = await db
        .select({ total: sql<number>`count(*)`.mapWith(Number) })
        .from(sessionRuns)
        .innerJoin(plans, eq(plans.id, sessionRuns.planId))
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
      summary: {
        id: string;
        createdAt: Date;
      } | null;
    }>,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;

      const where = [eq(sessionRuns.userId, userId), isNull(plans.deletedAt)];
      if (input.status) {
        where.push(eq(sessionRuns.status, input.status));
      }

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
        .innerJoin(planSessions, eq(planSessions.id, sessionRuns.sessionId))
        .innerJoin(plans, eq(plans.id, sessionRuns.planId))
        .leftJoin(
          sessionSummaries,
          eq(sessionSummaries.sessionRunId, sessionRuns.id),
        )
        .where(and(...where))
        .orderBy(desc(sessionRuns.startedAt))
        .limit(input.limit)
        .offset(offset);

      return rows.map((row) => ({
        runId: row.runId,
        status: row.status,
        startedAt: row.startedAt,
        endedAt: row.endedAt ?? null,
        exitReason: row.exitReason ?? null,
        sessionId: row.sessionId,
        sessionTitle: row.sessionTitle,
        sessionType: row.sessionType,
        planId: row.planId,
        planTitle: row.planTitle,
        planIcon: row.planIcon,
        planColor: row.planColor,
        summary: row.summaryId
          ? {
              id: row.summaryId,
              createdAt: row.summaryCreatedAt ?? row.startedAt,
            }
          : null,
      }));
    });
  },

  countRemainingSessions(planId: number): ResultAsync<number, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          remaining: sql<number>`sum(case when ${planSessions.status} in ('COMPLETED', 'SKIPPED', 'CANCELED') then 0 else 1 end)`,
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
      const db = getDb();
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

  /**
   * 사용자의 최근 학습 날짜 목록을 조회합니다.
   * streak 계산을 위해 COMPLETED 상태인 session run의 날짜를 조회합니다.
   */
  listDistinctStudyDates(
    userId: string,
    maxDays: number,
  ): ResultAsync<Array<Date>, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      // endedAt을 날짜별로 그룹화하여 최근 maxDays일간의 학습 날짜 조회
      const rows = await db
        .selectDistinct({
          studyDate: sql<Date>`date(${sessionRuns.endedAt})`,
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
        .filter((d): d is string | Date => d !== null)
        .map((d) => (typeof d === "string" ? new Date(`${d}T00:00:00Z`) : d));
    });
  },
};
