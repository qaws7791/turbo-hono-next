import { err, ok } from "neverthrow";

import { retrieveChunkRange } from "../../../ai/rag/retrieve";
import { generateSessionBlueprintWithAi } from "../../../ai/session/generate-blueprint";
import { ApiError } from "../../../middleware/error-handler";
import { SessionBlueprint, SessionRunDetailResponse } from "../session.dto";
import { sessionRepository } from "../session.repository";
import { isoDateTime } from "../session.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  PlanSessionType,
  SessionRunDetailResponse as SessionRunDetailResponseType,
} from "../session.dto";

export async function getRunDetail(
  userId: string,
  runId: string,
): Promise<Result<SessionRunDetailResponseType, AppError>> {
  // 1. Run + Session + Plan/Space 조회
  const detailResult = await sessionRepository.findRunDetail(userId, runId);
  if (detailResult.isErr()) return err(detailResult.error);
  const detail = detailResult.value;

  if (!detail) {
    return err(
      new ApiError(404, "SESSION_NOT_FOUND", "세션을 찾을 수 없습니다.", {
        runId,
      }),
    );
  }

  // 2. 마지막 진행 스냅샷 조회
  const snapshotResult = await sessionRepository.getLastProgressSnapshot(
    detail.run.id,
  );
  if (snapshotResult.isErr()) return err(snapshotResult.error);
  const snapshot = snapshotResult.value;

  const moduleTitle = detail.module?.title ?? "Module";
  const sessionType = detail.session.sessionType as PlanSessionType;

  const cachedBlueprintResult = await sessionRepository.findRunBlueprint(
    detail.run.id,
  );
  if (cachedBlueprintResult.isErr()) return err(cachedBlueprintResult.error);
  const cachedBlueprintRow = cachedBlueprintResult.value;

  let blueprint = cachedBlueprintRow
    ? (() => {
        const parse = SessionBlueprint.safeParse(
          cachedBlueprintRow.blueprintJson,
        );
        return parse.success ? parse.data : null;
      })()
    : null;

  if (!blueprint) {
    try {
      const chunkContents: Array<string> = [];
      if (detail.session.sourceReferences.length > 0) {
        const chunksList = await Promise.all(
          detail.session.sourceReferences.map((ref) =>
            retrieveChunkRange({
              userId,
              materialId: ref.materialId,
              startIndex: ref.chunkRange.start,
              endIndex: ref.chunkRange.end,
            }),
          ),
        );
        for (const chunks of chunksList) {
          chunkContents.push(...chunks.map((c) => c.content));
        }
      }

      const generated = await generateSessionBlueprintWithAi({
        sessionType,
        planTitle: detail.plan.title,
        moduleTitle,
        sessionTitle: detail.session.title,
        objective: detail.session.objective,
        estimatedMinutes: detail.session.estimatedMinutes,
        createdAt: detail.run.startedAt,
        chunkContents,
      });

      const parseResult = SessionBlueprint.safeParse(generated);
      if (!parseResult.success) {
        return err(
          new ApiError(
            500,
            "AI_GENERATION_FAILED",
            "세션 구성을 생성하는 데 실패했습니다. (스키마 불일치)",
          ),
        );
      }
      blueprint = parseResult.data;
    } catch (error) {
      return err(
        new ApiError(
          500,
          "AI_GENERATION_FAILED",
          "AI가 학습 세션을 생성하는 중 오류가 발생했습니다.",
          { error: error instanceof Error ? error.message : String(error) },
        ),
      );
    }

    const insertBlueprintResult = await sessionRepository.upsertRunBlueprint({
      runId: detail.run.id,
      schemaVersion: blueprint.schemaVersion,
      blueprintJson: blueprint as unknown as Record<string, unknown>,
      createdAt: new Date(),
    });
    if (insertBlueprintResult.isErr()) return err(insertBlueprintResult.error);
  }

  const endedAtForStats = detail.run.endedAt ?? new Date();
  const studyTimeMinutes = Math.max(
    0,
    Math.round(
      (endedAtForStats.getTime() - detail.run.startedAt.getTime()) / 60_000,
    ),
  );

  const blueprintWithStats = {
    ...blueprint,
    steps: blueprint.steps.map((step) => {
      if (step.type !== "SESSION_SUMMARY") return step;
      return {
        ...step,
        studyTimeMinutes,
      };
    }),
  };

  const stepIndex = snapshot?.stepIndex ?? 0;
  const inputs = snapshot?.payloadJson ?? {};
  const savedAt = snapshot?.createdAt ? isoDateTime(snapshot.createdAt) : null;

  return ok(
    SessionRunDetailResponse.parse({
      data: {
        runId: detail.run.publicId,
        status: detail.run.status,
        startedAt: isoDateTime(detail.run.startedAt),
        endedAt: detail.run.endedAt ? isoDateTime(detail.run.endedAt) : null,
        exitReason: detail.run.exitReason,
        session: {
          sessionId: detail.session.publicId,
          title: detail.session.title,
          objective: detail.session.objective,
          sessionType,
          estimatedMinutes: detail.session.estimatedMinutes,
          module: detail.module
            ? { id: detail.module.id, title: detail.module.title }
            : null,
          plan: {
            id: detail.plan.publicId,
            title: detail.plan.title,
            icon: detail.plan.icon,
            color: detail.plan.color,
          },
        },
        blueprint: blueprintWithStats,
        progress: { stepIndex, inputs, savedAt },
        summary: detail.summary
          ? {
              id: detail.summary.id,
              summaryMd: detail.summary.summaryMd,
              createdAt: isoDateTime(detail.summary.createdAt),
            }
          : null,
      },
    }),
  );
}
