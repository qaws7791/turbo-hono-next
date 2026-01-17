import { tryPromise, unwrap } from "../../../lib/result";
import { isoDateTime } from "../../../lib/utils/date";
import { ApiError } from "../../../middleware/error-handler";
import { SessionBlueprint, SessionRunDetailResponse } from "../session.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  PlanSessionType,
  SessionRunDetailResponse as SessionRunDetailResponseType,
} from "../session.dto";
import type { SessionRepository } from "../session.repository";

export type RagRetrieverForSessionPort = {
  retrieveRange: (params: {
    readonly userId: string;
    readonly materialId: string;
    readonly startIndex: number;
    readonly endIndex: number;
  }) => Promise<ReadonlyArray<{ content: string }>>;
};

export type SessionBlueprintGeneratorPort = {
  generate: (input: {
    readonly sessionType: "LEARN";
    readonly planTitle: string;
    readonly moduleTitle: string;
    readonly sessionTitle: string;
    readonly objective: string | null;
    readonly estimatedMinutes: number;
    readonly createdAt: Date;
    readonly chunkContents: ReadonlyArray<string>;
  }) => Promise<unknown>;
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
    return tryPromise(async () => {
      // 1. Run + Session + Plan/Space 조회
      const detail = await unwrap(
        deps.sessionRepository.findRunDetail(userId, runId),
      );

      if (!detail) {
        throw new ApiError(
          404,
          "SESSION_NOT_FOUND",
          "세션을 찾을 수 없습니다.",
          {
            runId,
          },
        );
      }

      // 2. 마지막 진행 스냅샷 조회
      const snapshot = await unwrap(
        deps.sessionRepository.getLastProgressSnapshot(detail.run.id),
      );

      const moduleTitle = detail.module?.title ?? "Module";
      const sessionType = detail.session.sessionType as PlanSessionType;

      const cachedBlueprintRow = await unwrap(
        deps.sessionRepository.findRunBlueprint(detail.run.id),
      );

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
          if (
            detail.session.sourceReferences &&
            detail.session.sourceReferences.length > 0
          ) {
            const chunksList = await Promise.all(
              detail.session.sourceReferences.map((ref) =>
                deps.ragRetriever.retrieveRange({
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

          const generated = await deps.sessionBlueprintGenerator.generate({
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
            throw new ApiError(
              500,
              "AI_GENERATION_FAILED",
              "세션 구성을 생성하는 데 실패했습니다. (스키마 불일치)",
            );
          }

          blueprint = parseResult.data;
        } catch (error) {
          if (error instanceof ApiError) {
            throw error;
          }
          throw new ApiError(
            500,
            "AI_GENERATION_FAILED",
            "AI가 학습 세션을 생성하는 중 오류가 발생했습니다.",
            { error: error instanceof Error ? error.message : String(error) },
          );
        }

        await unwrap(
          deps.sessionRepository.upsertRunBlueprint({
            runId: detail.run.id,
            schemaVersion: blueprint.schemaVersion,
            blueprintJson: blueprint as unknown as Record<string, unknown>,
            createdAt: new Date(),
          }),
        );
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
      const savedAt = snapshot?.createdAt
        ? isoDateTime(snapshot.createdAt)
        : null;

      return SessionRunDetailResponse.parse({
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
      });
    });
  };
}
