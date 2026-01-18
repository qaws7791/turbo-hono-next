import { getAiModels } from "../../lib/ai";
import { getDb } from "../../lib/db";
import { logger } from "../../lib/logger";
import { ApiError } from "../../middleware/error-handler";
import { createMaterialRepository } from "../../modules/material";
import { ragRetriever } from "../rag";

import {
  buildModulePopulationSystemPrompt,
  buildModulePopulationUserPrompt,
  buildStructurePlanningSystemPrompt,
  buildStructurePlanningUserPrompt,
} from "./prompts";
import { ModuleSessionsSchema, PlanStructureSchema } from "./schema";

import type { PlanStructure } from "./schema";
import type {
  GeneratePlanInput,
  GeneratePlanResult,
  GeneratedModule,
  GeneratedSession,
} from "./types";

/**
 * 자료 메타정보 내부 타입
 */
interface MaterialMetadata {
  id: string;
  title: string;
  chunkCount: number;
  outline: Array<{
    depth: number;
    path: string;
    title: string;
    summary: string | null;
    keywords: Array<string> | null;
    metadataJson: {
      pageStart?: number;
      pageEnd?: number;
      lineStart?: number;
      lineEnd?: number;
    } | null;
  }>;
}

/**
 * 생성된 세션 내부 타입 (dayOffset 할당 전)
 */
interface RawPopulatedSession {
  sessionType: "LEARN";
  title: string;
  objective: string;
  estimatedMinutes: number;
  moduleIndex: number;
  sourceReferences: ReadonlyArray<{
    readonly materialId: string;
    readonly chunkRange: {
      readonly start: number;
      readonly end: number;
    };
  }>;
}

/**
 * 학습 계획 생성기
 *
 * 1단계: 메타정보 기반 구조 설계 (모듈 구조와 모듈별 세션 수 결정)
 * 2단계: 모듈별 세션 상세 생성 (각 모듈의 청크로 세션 제목/목표 일괄 생성)
 */
export class LearningPlanGenerator {
  private readonly MAX_SESSIONS_PER_DAY = 3;
  private readonly CONCURRENCY_LIMIT = 3;

  /**
   * AI 기반 학습 계획 생성 메인 진입점
   */
  async generate(input: GeneratePlanInput): Promise<GeneratePlanResult> {
    // 1. 자료 메타정보 및 청크 통계 조회
    const materialsMetadata = await this.fetchMaterialsMetadata(
      input.userId,
      input.materialIds,
    );

    // 2. [1단계] 구조 설계 AI 호출
    const structure = await this.designStructure(input, materialsMetadata);

    logger.info(
      {
        moduleCount: structure.modules.length,
        totalSessionCount: structure.modules.reduce(
          (sum, m) => sum + m.sessionCount,
          0,
        ),
      },
      "[LearningPlanGenerator] 구조 설계 완료",
    );

    // 3. [2단계] 모듈별 세션 상세 생성 (병렬 처리)
    const sessions = await this.populateAllModules(structure, {
      userId: input.userId,
      materials: materialsMetadata,
    });

    // 4. 결과 변환 및 반환
    return this.transformToResult(structure, sessions, input.materialIds);
  }

  /**
   * 자료 메타정보 및 청크 통계 조회
   */
  private async fetchMaterialsMetadata(
    userId: string,
    materialIds: ReadonlyArray<string>,
  ): Promise<Array<MaterialMetadata>> {
    const materialRepository = createMaterialRepository(getDb());

    const [metaResult, outlineResult, statsResult] = await Promise.all([
      materialRepository.findMaterialsMetaForPlan(materialIds),
      materialRepository.findOutlineNodesForPlan(materialIds),
      ragRetriever.getMaterialsChunkStats({ userId, materialIds }),
    ]);

    if (metaResult.isErr()) {
      logger.warn(
        { error: metaResult.error },
        "[LearningPlanGenerator] 자료 메타 조회 실패",
      );
      throw new ApiError(
        500,
        "DATA_FETCH_FAILED",
        "자료 정보를 불러올 수 없습니다.",
      );
    }

    const outlineByMaterialId = new Map<
      string,
      Array<MaterialMetadata["outline"][number]>
    >();
    if (outlineResult.isOk()) {
      for (const row of outlineResult.value) {
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
    }

    if (statsResult.isErr()) {
      logger.error(
        { error: statsResult.error },
        "[LearningPlanGenerator] 청크 통계 조회 실패",
      );
      throw new ApiError(
        500,
        "CHUNK_STATS_FETCH_FAILED",
        "자료의 통계 정보를 불러올 수 없습니다.",
      );
    }

    const statsMap = statsResult.value;

    return metaResult.value.map((mat) => ({
      id: mat.id,
      title: mat.title,
      chunkCount: statsMap.get(mat.id)?.chunkCount ?? 0,
      outline: outlineByMaterialId.get(mat.id) ?? [],
    }));
  }

  /**
   * 1단계: 학습 구조 설계 (AI 호출)
   */
  private async designStructure(
    input: GeneratePlanInput,
    materials: Array<MaterialMetadata>,
  ): Promise<PlanStructure> {
    const totalChunkCount = materials.reduce(
      (sum, mat) => sum + mat.chunkCount,
      0,
    );

    const systemPrompt = buildStructurePlanningSystemPrompt();
    const userPrompt = buildStructurePlanningUserPrompt({
      targetDueDate: input.targetDueDate,
      specialRequirements: input.specialRequirements,
      requestedSessionCount: input.requestedSessionCount,
      materials: materials.map((mat) => ({
        title: mat.title,
        chunkCount: mat.chunkCount,
        outline: mat.outline,
      })),
      totalChunkCount,
    });

    try {
      return await getAiModels().chat.generateStructuredOutput(
        {
          config: {
            systemInstruction: systemPrompt,
          },
          contents: [userPrompt],
        },
        PlanStructureSchema,
      );
    } catch (err) {
      logger.error({ err }, "[LearningPlanGenerator] AI 구조 설계 실패");
      throw new ApiError(
        500,
        "AI_PLAN_STRUCTURE_FAILED",
        "학습 구조를 설계하는 중에 오류가 발생했습니다.",
      );
    }
  }

  /**
   * 2단계: 모든 모듈에 대해 세션 생성 흐름 제어
   */
  private async populateAllModules(
    structure: PlanStructure,
    context: {
      userId: string;
      materials: Array<MaterialMetadata>;
    },
  ): Promise<Array<GeneratedSession>> {
    const results: Array<Array<RawPopulatedSession>> =
      await this.processWithConcurrency(
        structure.modules,
        async (module, index) => {
          return this.populateSingleModule(
            module,
            index,
            structure.modules.length,
            context,
          );
        },
        this.CONCURRENCY_LIMIT,
      );

    const allSessions = results.flat();
    return this.assignDayOffsets(allSessions);
  }

  /**
   * 개별 모듈에 대한 세션 생성
   */
  private async populateSingleModule(
    module: PlanStructure["modules"][number],
    moduleIndex: number,
    totalModules: number,
    context: {
      userId: string;
      materials: Array<MaterialMetadata>;
    },
  ): Promise<Array<RawPopulatedSession>> {
    const material = context.materials[module.materialIndex];
    if (!material) {
      throw new ApiError(
        500,
        "MATERIAL_NOT_FOUND",
        `모듈 "${module.title}"에 해당하는 자료를 찾을 수 없습니다.`,
      );
    }

    const startIndex = Math.max(0, module.chunkRange.start);
    const endIndex = Math.min(material.chunkCount - 1, module.chunkRange.end);

    const chunks = await ragRetriever.retrieveRange({
      userId: context.userId,
      materialId: material.id,
      startIndex,
      endIndex,
    });

    const chunkContents = chunks.map((c) => c.content);
    if (chunkContents.length === 0) {
      logger.error(
        {
          moduleTitle: module.title,
          materialId: material.id,
          requestedRange: module.chunkRange,
          actualRange: { startIndex, endIndex },
          materialChunkCount: material.chunkCount,
        },
        "[LearningPlanGenerator] 청크 조회 결과 없음",
      );
      throw new ApiError(
        500,
        "EMPTY_MATERIAL_CHUNKS",
        `모듈 "${module.title}"의 학습 내용을 불러올 수 없습니다. (범위: ${startIndex}-${endIndex}, 전체: ${material.chunkCount})`,
      );
    }

    try {
      const systemPrompt = buildModulePopulationSystemPrompt();
      const userPrompt = buildModulePopulationUserPrompt({
        moduleTitle: module.title,
        moduleDescription: module.description,
        moduleIndex,
        totalModules,
        sessionCount: module.sessionCount,
        chunkContents,
      });

      const parsed = await getAiModels().chat.generateStructuredOutput(
        {
          config: {
            systemInstruction: systemPrompt,
          },
          contents: [userPrompt],
        },
        ModuleSessionsSchema,
      );

      return parsed.map((sess) => ({
        sessionType: "LEARN" as const,
        title: sess.title,
        objective: sess.objective,
        estimatedMinutes: sess.estimatedMinutes,
        moduleIndex,
        sourceReferences: [
          {
            materialId: material.id,
            chunkRange: {
              start: module.chunkRange.start + sess.chunkStart,
              end: module.chunkRange.start + sess.chunkEnd,
            },
          },
        ],
      }));
    } catch (error) {
      logger.error(
        { error, moduleTitle: module.title },
        "[LearningPlanGenerator] AI 모듈 세션 생성 실패",
      );
      throw new ApiError(
        500,
        "AI_MODULE_POPULATION_FAILED",
        `모듈 "${module.title}"의 상세 세션을 생성하는 중에 오류가 발생했습니다.`,
      );
    }
  }

  /**
   * 응답 객체로 변환
   */
  private transformToResult(
    structure: PlanStructure,
    sessions: Array<GeneratedSession>,
    materialIds: ReadonlyArray<string>,
  ): GeneratePlanResult {
    const modules: Array<GeneratedModule> = structure.modules.map((mod) => ({
      title: mod.title,
      description: mod.description,
      orderIndex: mod.orderIndex,
      materialId: materialIds[mod.materialIndex] ?? materialIds[0]!,
    }));

    const normalizedSessions: Array<GeneratedSession> = sessions.map(
      (sess) => ({
        ...sess,
        moduleIndex: Math.min(sess.moduleIndex, modules.length - 1),
      }),
    );

    return {
      title: structure.title,
      summary: structure.summary,
      modules,
      sessions: normalizedSessions,
    };
  }

  /**
   * 동시성 제어 유틸리티
   */
  private async processWithConcurrency<T, TResult>(
    items: ReadonlyArray<T>,
    processor: (item: T, index: number) => Promise<TResult>,
    concurrency: number,
  ): Promise<Array<TResult>> {
    const results: Array<TResult> = new Array(items.length);
    let currentIndex = 0;

    const processNext = async () => {
      while (currentIndex < items.length) {
        const index = currentIndex++;
        results[index] = await processor(items[index]!, index);
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(concurrency, items.length) }, () =>
        processNext(),
      ),
    );
    return results;
  }

  /**
   * 날짜 오프셋 할당
   */
  private assignDayOffsets(
    sessions: Array<RawPopulatedSession>,
  ): Array<GeneratedSession> {
    let currentDay = 0;
    let sessionsOnCurrentDay = 0;

    return sessions.map((session) => {
      if (sessionsOnCurrentDay >= this.MAX_SESSIONS_PER_DAY) {
        currentDay++;
        sessionsOnCurrentDay = 0;
      }
      sessionsOnCurrentDay++;
      return {
        sessionType: session.sessionType,
        title: session.title,
        objective: session.objective,
        estimatedMinutes: session.estimatedMinutes,
        moduleIndex: session.moduleIndex,
        sourceReferences: session.sourceReferences,
        dayOffset: currentDay,
      };
    });
  }
}

export const learningPlanGenerator = new LearningPlanGenerator();
