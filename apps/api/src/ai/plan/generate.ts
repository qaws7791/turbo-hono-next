import { logger } from "../../lib/logger";
import { getMaterialsChunkStats } from "../rag/stats";

import { populateAllSessions } from "./populate";
import { generatePlanStructure } from "./structure";

import type {
  GeneratePlanInput,
  GeneratePlanResult,
  GeneratedModule,
  GeneratedSession,
} from "./types";

// materialRepository는 모듈 경계를 넘어 직접 import 할 수 없으므로
// 필요한 함수만 동적으로 가져옵니다
async function getMaterialsMetaForPlan(materialIds: ReadonlyArray<string>) {
  const { materialRepository } = await import(
    "../../modules/material/material.repository"
  );
  return materialRepository.findMaterialsMetaForPlan(materialIds);
}

async function getOutlineNodesForPlan(materialIds: ReadonlyArray<string>) {
  const { materialRepository } = await import(
    "../../modules/material/material.repository"
  );
  return materialRepository.findOutlineNodesForPlan(materialIds);
}

// ============================================
// 2단계 파이프라인 (새로운 방식)
// ============================================

/**
 * 자료 메타정보 및 청크 통계 조회
 */
async function fetchMaterialsMetadata(params: {
  readonly userId: string;
  readonly materialIds: ReadonlyArray<string>;
}): Promise<
  ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly chunkCount: number;
    readonly outline: ReadonlyArray<{
      readonly depth: number;
      readonly path: string;
      readonly title: string;
      readonly summary: string | null;
      readonly keywords: ReadonlyArray<string> | null;
      readonly metadataJson: {
        readonly pageStart?: number;
        readonly pageEnd?: number;
        readonly lineStart?: number;
        readonly lineEnd?: number;
      } | null;
    }>;
  }>
> {
  // DB에서 자료 기본 정보 조회
  const metaResult = await getMaterialsMetaForPlan(params.materialIds);
  if (metaResult.isErr()) {
    logger.warn(
      { error: metaResult.error },
      "[fetchMaterialsMetadata] 자료 메타 조회 실패",
    );
    return params.materialIds.map((id) => ({
      id,
      title: "Unknown Material",
      chunkCount: 0,
      outline: [],
    }));
  }
  const materialsMeta = metaResult.value;

  const outlineResult = await getOutlineNodesForPlan(params.materialIds);
  if (outlineResult.isErr()) {
    logger.warn(
      { error: outlineResult.error },
      "[fetchMaterialsMetadata] outline 조회 실패",
    );
  }
  const outlineRows = outlineResult.isOk() ? outlineResult.value : [];
  const outlineByMaterialId = new Map<
    string,
    Array<{
      readonly depth: number;
      readonly path: string;
      readonly title: string;
      readonly summary: string | null;
      readonly keywords: ReadonlyArray<string> | null;
      readonly metadataJson: {
        readonly pageStart?: number;
        readonly pageEnd?: number;
        readonly lineStart?: number;
        readonly lineEnd?: number;
      } | null;
    }>
  >();
  for (const row of outlineRows) {
    const current = outlineByMaterialId.get(row.materialId) ?? [];
    current.push({
      depth: row.depth,
      path: row.path,
      title: row.title,
      summary: row.summary ?? null,
      keywords: row.keywords ?? null,
      metadataJson: row.metadataJson ?? null,
    });
    outlineByMaterialId.set(row.materialId, current);
  }

  // 청크 통계 조회
  const statsResult = await getMaterialsChunkStats({
    userId: params.userId,
    materialIds: params.materialIds,
  });
  if (statsResult.isErr()) {
    logger.warn(
      { error: statsResult.error },
      "[fetchMaterialsMetadata] 청크 통계 조회 실패",
    );
    return materialsMeta.map((mat) => ({
      id: mat.id,
      title: mat.title,
      chunkCount: 0,
      outline: [],
    }));
  }
  const statsMap = statsResult.value;

  // 메타정보와 청크 통계 결합
  return materialsMeta.map((mat) => ({
    id: mat.id,
    title: mat.title,
    chunkCount: statsMap.get(mat.id)?.chunkCount ?? 0,
    outline: outlineByMaterialId.get(mat.id) ?? [],
  }));
}

/**
 * PlanStructure를 GeneratePlanResult로 변환
 */
function transformStructureToResult(
  structure: Awaited<ReturnType<typeof generatePlanStructure>>,
  populatedSessions: ReadonlyArray<{
    readonly sessionType: "LEARN";
    readonly title: string;
    readonly objective: string;
    readonly estimatedMinutes: number;
    readonly dayOffset: number;
    readonly moduleIndex: number;
    readonly sourceReferences: ReadonlyArray<{
      readonly materialId: string;
      readonly chunkRange: {
        readonly start: number;
        readonly end: number;
      };
    }>;
  }>,
  materialIds: ReadonlyArray<string>,
): GeneratePlanResult {
  const modules: Array<GeneratedModule> = structure.modules.map((mod) => ({
    title: mod.title,
    description: mod.description,
    orderIndex: mod.orderIndex,
    materialId: materialIds[mod.materialIndex] ?? materialIds[0]!,
  }));

  const sessions: Array<GeneratedSession> = populatedSessions.map((sess) => ({
    sessionType: sess.sessionType,
    title: sess.title,
    objective: sess.objective,
    estimatedMinutes: sess.estimatedMinutes,
    dayOffset: sess.dayOffset,
    moduleIndex: Math.min(sess.moduleIndex, modules.length - 1),
    sourceReferences: sess.sourceReferences,
  }));

  return {
    title: structure.title,
    summary: structure.summary,
    modules,
    sessions,
  };
}

/**
 * 2단계 파이프라인으로 학습 계획 생성
 */
async function generatePlanWithTwoPhase(
  input: GeneratePlanInput,
): Promise<GeneratePlanResult> {
  // 1. 자료 메타정보 및 청크 통계 조회
  const materialsWithStats = await fetchMaterialsMetadata({
    userId: input.userId,
    materialIds: input.materialIds,
  });

  // 2. [1단계] 구조 설계 AI 호출
  const structure = await generatePlanStructure({
    goalType: input.goalType,
    currentLevel: input.currentLevel,
    targetDueDate: input.targetDueDate,
    specialRequirements: input.specialRequirements,
    requestedSessionCount: input.requestedSessionCount,
    materials: materialsWithStats,
  });

  logger.info(
    {
      sessionCount: structure.sessionCount,
      reasoning: structure.reasoning,
    },
    "[generatePlanWithTwoPhase] 구조 설계 완료",
  );

  // 3. [2단계] 세션 상세화 (병렬 처리)
  const populatedSessions = await populateAllSessions(
    structure,
    {
      userId: input.userId,
      materials: materialsWithStats,
      currentLevel: input.currentLevel,
    },
    { concurrency: 5 },
  );

  // 4. 결과 변환
  return transformStructureToResult(
    structure,
    populatedSessions,
    input.materialIds,
  );
}

// ============================================
// 메인 함수
// ============================================

/**
 * AI 기반 개인화된 학습 계획 생성 (2단계 파이프라인)
 *
 * 1단계: 메타정보 기반 구조 설계 - 자료 분량에 맞는 세션 수 결정
 * 2단계: 세션별 상세 내용 생성 - 각 세션에 해당하는 청크로 제목/목표 생성
 *
 * 에러 발생 시 폴백 없이 그대로 전파됩니다.
 */
export { generatePlanWithTwoPhase as generatePlanWithAi };
