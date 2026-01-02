import { err, ok } from "neverthrow";

import { generateSessionBlueprintWithAi } from "../../../ai/session/generate-blueprint";
import { retrieveTopChunks } from "../../../ai/rag/retrieve";
import { ApiError } from "../../../middleware/error-handler";
import { buildSessionBlueprint } from "../session.blueprint";
import { SessionBlueprint, SessionRunDetailResponse } from "../session.dto";
import { sessionRepository } from "../session.repository";
import { isoDateTime } from "../session.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { RagSearchResult } from "../../../ai/rag/types";
import type {
  PlanSessionType,
  SessionRunDetailResponse as SessionRunDetailResponseType,
} from "../session.dto";

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  if (maxLength <= 1) return "…";
  return `${value.slice(0, maxLength - 1)}…`;
}

function quoteMarkdown(value: string): string {
  const lines = value.split("\n");
  return lines.map((line) => `> ${line}`).join("\n");
}

function buildRagConceptMarkdown(input: {
  sessionTitle: string;
  objective: string | null;
  chunks: ReadonlyArray<RagSearchResult>;
}): string {
  const objective = input.objective?.trim().length
    ? input.objective.trim()
    : null;

  const objectiveSection = objective ? `\n\n## 목표\n\n- ${objective}\n` : "";

  const excerpts = input.chunks.slice(0, 6).map((chunk, index) => {
    const source =
      typeof chunk.metadata.pageNumber === "number"
        ? `${chunk.metadata.materialTitle} p.${chunk.metadata.pageNumber}`
        : chunk.metadata.materialTitle;

    const trimmed = truncateText(chunk.content.trim(), 700);
    return [`### ${index + 1}. ${source}`, "", quoteMarkdown(trimmed), ""].join(
      "\n",
    );
  });

  const excerptSection = excerpts.length
    ? `\n\n## 자료 발췌\n\n${excerpts.join("\n")}`
    : "\n\n## 자료 발췌\n\n(관련 내용을 찾지 못했습니다.)\n";

  return truncateText(
    [
      `# ${input.sessionTitle}`,
      objectiveSection,
      "",
      "## 핵심",
      "",
      "이 세션은 업로드한 자료에서 관련 부분을 발췌해 빠르게 읽고 정리합니다.",
      excerptSection,
    ].join("\n"),
    10_000,
  );
}

function isBlueprintCompatibleWithTemplate(input: {
  readonly blueprint: SessionBlueprint;
  readonly template: SessionBlueprint;
}): boolean {
  if (input.blueprint.steps.length !== input.template.steps.length)
    return false;
  return input.blueprint.steps.every((step, index) => {
    const templateStep = input.template.steps[index];
    if (!templateStep) return false;
    return step.id === templateStep.id && step.type === templateStep.type;
  });
}

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
    const template = buildSessionBlueprint({
      sessionType,
      planTitle: detail.plan.title,
      moduleTitle,
      sessionTitle: detail.session.title,
      objective: detail.session.objective,
      estimatedMinutes: detail.session.estimatedMinutes,
      createdAt: detail.run.startedAt,
    });

    let ragConceptContent: string | null = null;
    try {
      const materialIdsResult =
        await sessionRepository.listPlanSourceMaterialIds(detail.plan.id);
      if (materialIdsResult.isOk()) {
        const materialIds = materialIdsResult.value;
        if (materialIds.length > 0) {
          const query = detail.session.objective?.trim().length
            ? `${detail.session.title} - ${detail.session.objective}`
            : detail.session.title;

          const chunks = await retrieveTopChunks({
            userId,
            spaceId: detail.space.id,
            materialIds,
            query,
            topK: 8,
          });

          ragConceptContent = buildRagConceptMarkdown({
            sessionTitle: detail.session.title,
            objective: detail.session.objective,
            chunks,
          });
        }
      }
    } catch {
      ragConceptContent = null;
    }

    const templateWithRag = ragConceptContent
      ? {
          ...template,
          steps: template.steps.map((step) => {
            if (step.type !== "CONCEPT") return step;
            return { ...step, content: ragConceptContent };
          }),
        }
      : template;

    try {
      const generated = await generateSessionBlueprintWithAi({
        sessionType,
        planTitle: detail.plan.title,
        moduleTitle,
        sessionTitle: detail.session.title,
        objective: detail.session.objective,
        estimatedMinutes: detail.session.estimatedMinutes,
        template: templateWithRag,
      });

      const parse = SessionBlueprint.safeParse(generated);
      blueprint =
        parse.success &&
        isBlueprintCompatibleWithTemplate({
          blueprint: parse.data,
          template: templateWithRag,
        })
          ? {
              ...parse.data,
              schemaVersion: templateWithRag.schemaVersion,
              createdAt: templateWithRag.createdAt,
              startStepIndex: templateWithRag.startStepIndex,
            }
          : null;
    } catch {
      blueprint = null;
    }

    if (!blueprint) {
      blueprint = SessionBlueprint.parse(templateWithRag);
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
  const savedConceptCount = detail.summary
    ? detail.summary.conceptsCreatedCount + detail.summary.conceptsUpdatedCount
    : undefined;

  const blueprintWithStats = {
    ...blueprint,
    steps: blueprint.steps.map((step) => {
      if (step.type !== "SESSION_SUMMARY") return step;
      return {
        ...step,
        studyTimeMinutes,
        savedConceptCount,
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
          plan: { id: detail.plan.publicId, title: detail.plan.title },
          space: { id: detail.space.publicId, name: detail.space.name },
        },
        blueprint: blueprintWithStats,
        progress: { stepIndex, inputs, savedAt },
        summary: detail.summary
          ? {
              id: detail.summary.id,
              summaryMd: detail.summary.summaryMd,
              conceptsCreatedCount: detail.summary.conceptsCreatedCount,
              conceptsUpdatedCount: detail.summary.conceptsUpdatedCount,
              reviewsScheduledCount: detail.summary.reviewsScheduledCount,
              createdAt: isoDateTime(detail.summary.createdAt),
            }
          : null,
      },
    }),
  );
}
