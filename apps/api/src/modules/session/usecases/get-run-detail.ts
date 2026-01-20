import { ResultAsync, err, ok, okAsync, safeTry } from "neverthrow";

import { isoDateTime } from "../../../lib/utils/date";
import { parseOrInternalError } from "../../../lib/zod";
import { ApiError } from "../../../middleware/error-handler";
import { SessionBlueprint, SessionRunDetailResponse } from "../session.dto";

import type { AppError } from "../../../lib/result";
import type {
  PlanSessionType,
  SessionBlueprint as SessionBlueprintType,
  SessionRunDetailResponse as SessionRunDetailResponseType,
} from "../session.dto";
import type { SessionRepository } from "../session.repository";

export type RagRetrieverForSessionPort = {
  retrieveRange: (params: {
    readonly userId: string;
    readonly materialId: string;
    readonly startIndex: number;
    readonly endIndex: number;
  }) => ResultAsync<ReadonlyArray<{ content: string }>, AppError>;
};

export type SessionBlueprintGeneratorPort = {
  generate: (input: {
    readonly sessionType: "LEARN";
    readonly planTitle: string;
    readonly moduleTitle: string;
    readonly sessionTitle: string;
    readonly objective: string;
    readonly estimatedMinutes: number;
    readonly createdAt: Date;
    readonly chunkContents: ReadonlyArray<string>;
  }) => ResultAsync<SessionBlueprintType, AppError>;
};

export function getRunDetail(deps: {
  readonly sessionRepository: SessionRepository;
  readonly ragRetriever: RagRetrieverForSessionPort;
  readonly sessionBlueprintGenerator: SessionBlueprintGeneratorPort;
}) {
  return function getRunDetail(
    userId: string,
    runId: string,
  ): ResultAsync<SessionRunDetailResponseType, AppError> {
    const buildChunkContents = (
      refs:
        | ReadonlyArray<{
            materialId: string;
            chunkRange: { start: number; end: number };
          }>
        | null
        | undefined,
    ): ResultAsync<Array<string>, AppError> => {
      if (!refs || refs.length === 0) return okAsync([]);

      return ResultAsync.combine(
        refs.map((ref) =>
          deps.ragRetriever
            .retrieveRange({
              userId,
              materialId: ref.materialId,
              startIndex: ref.chunkRange.start,
              endIndex: ref.chunkRange.end,
            })
            .map((chunks) => chunks.map((c) => c.content)),
        ),
      ).map((lists) => lists.flat());
    };

    return safeTry(async function* () {
      const detail = yield* deps.sessionRepository.findRunDetail(userId, runId);
      if (!detail) {
        return err(
          new ApiError(404, "SESSION_NOT_FOUND", "세션을 찾을 수 없습니다.", {
            runId,
          }),
        );
      }

      const snapshot = yield* deps.sessionRepository.getLastProgressSnapshot(
        detail.run.id,
      );

      const moduleTitle = detail.module?.title ?? "Module";
      const sessionType = detail.session.sessionType as PlanSessionType;

      const cachedBlueprintRow = yield* deps.sessionRepository.findRunBlueprint(
        detail.run.id,
      );

      const cachedBlueprint = cachedBlueprintRow
        ? (() => {
            const parsed = SessionBlueprint.safeParse(
              cachedBlueprintRow.blueprintJson,
            );
            return parsed.success ? parsed.data : null;
          })()
        : null;

      const blueprint = yield* cachedBlueprint
        ? ok(cachedBlueprint)
        : buildChunkContents(detail.session.sourceReferences).andThen(
            (chunkContents) =>
              deps.sessionBlueprintGenerator
                .generate({
                  sessionType,
                  planTitle: detail.plan.title,
                  moduleTitle,
                  sessionTitle: detail.session.title,
                  objective: detail.session.objective,
                  estimatedMinutes: detail.session.estimatedMinutes,
                  createdAt: detail.run.startedAt,
                  chunkContents,
                })
                .andThen((generated) =>
                  deps.sessionRepository
                    .upsertRunBlueprint({
                      runId: detail.run.id,
                      schemaVersion: generated.schemaVersion,
                      blueprintJson: generated as unknown as Record<
                        string,
                        unknown
                      >,
                      createdAt: new Date(),
                    })
                    .map(() => generated),
                ),
          );

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
      const savedAt = snapshot?.createdAt
        ? isoDateTime(snapshot.createdAt)
        : null;

      const response = yield* parseOrInternalError(
        SessionRunDetailResponse,
        {
          data: {
            runId: detail.run.publicId,
            status: detail.run.status,
            startedAt: isoDateTime(detail.run.startedAt),
            endedAt: detail.run.endedAt
              ? isoDateTime(detail.run.endedAt)
              : null,
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
        },
        "SessionRunDetailResponse",
      );

      return ok(response);
    });
  };
}
