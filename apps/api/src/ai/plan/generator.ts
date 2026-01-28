import * as neverthrow from "neverthrow";

import { getAiModelsAsync } from "../../lib/ai";
import { combineResults, fromPromise } from "../../lib/result";
import { ApiError } from "../../middleware/error-handler";

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
import type { AppError } from "../../lib/result";
import type { Logger } from "pino";
import type { MaterialRepository } from "@repo/core/modules/material";
import type { RagRetriever } from "../rag";

const { err, ok } = neverthrow;

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
export type LearningPlanGeneratorDeps = {
  readonly logger: Logger;
  readonly materialRepository: Pick<
    MaterialRepository,
    "findMaterialsMetaForPlan" | "findOutlineNodesForPlan"
  >;
  readonly ragRetriever: Pick<
    RagRetriever,
    "getMaterialsChunkStats" | "retrieveRange"
  >;
};

export class LearningPlanGenerator {
  private readonly logger: Logger;
  private readonly materialRepository: LearningPlanGeneratorDeps["materialRepository"];
  private readonly ragRetriever: LearningPlanGeneratorDeps["ragRetriever"];

  private readonly MAX_SESSIONS_PER_DAY = 3;
  private readonly CONCURRENCY_LIMIT = 3;

  constructor(deps: LearningPlanGeneratorDeps) {
    this.logger = deps.logger;
    this.materialRepository = deps.materialRepository;
    this.ragRetriever = deps.ragRetriever;
  }

  /**
   * AI 기반 학습 계획 생성 메인 진입점
   */
  generate(
    input: GeneratePlanInput,
  ): neverthrow.ResultAsync<GeneratePlanResult, AppError> {
    return this.fetchMaterialsMetadata(input.userId, input.materialIds)
      .andThen((materialsMetadata) =>
        this.designStructure(input, materialsMetadata).map((structure) => {
          this.logger.info(
            {
              moduleCount: structure.modules.length,
              totalSessionCount: structure.modules.reduce(
                (sum, m) => sum + m.sessionCount,
                0,
              ),
            },
            "[LearningPlanGenerator] 구조 설계 완료",
          );
          return { structure, materialsMetadata };
        }),
      )
      .andThen(({ structure, materialsMetadata }) =>
        this.populateAllModules(structure, {
          userId: input.userId,
          materials: materialsMetadata,
        }).map((sessions) => ({ structure, sessions })),
      )
      .map(({ structure, sessions }) =>
        this.transformToResult(structure, sessions, input.materialIds),
      );
  }

  /**
   * 자료 메타정보 및 청크 통계 조회
   */
  private fetchMaterialsMetadata(
    userId: string,
    materialIds: ReadonlyArray<string>,
  ): neverthrow.ResultAsync<Array<MaterialMetadata>, AppError> {
    return combineResults([
      this.materialRepository.findMaterialsMetaForPlan(materialIds),
      this.materialRepository.findOutlineNodesForPlan(materialIds),
      this.ragRetriever.getMaterialsChunkStats({ userId, materialIds }),
    ]).map(([metaRows, outlineRows, statsMap]) => {
      const outlineByMaterialId = new Map<
        string,
        Array<MaterialMetadata["outline"][number]>
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

      return metaRows.map((mat) => ({
        id: mat.id,
        title: mat.title,
        chunkCount: statsMap.get(mat.id)?.chunkCount ?? 0,
        outline: outlineByMaterialId.get(mat.id) ?? [],
      }));
    });
  }

  /**
   * 1단계: 학습 구조 설계 (AI 호출)
   */
  private designStructure(
    input: GeneratePlanInput,
    materials: Array<MaterialMetadata>,
  ): neverthrow.ResultAsync<PlanStructure, AppError> {
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

    return getAiModelsAsync()
      .andThen((models) =>
        models.chat.generateStructuredOutput(
          {
            config: {
              systemInstruction: systemPrompt,
            },
            contents: [userPrompt],
          },
          PlanStructureSchema,
        ),
      )
      .mapErr((error) => {
        this.logger.error(
          { error },
          "[LearningPlanGenerator] AI 구조 설계 실패",
        );
        return new ApiError(
          500,
          "AI_PLAN_STRUCTURE_FAILED",
          "학습 구조를 설계하는 중에 오류가 발생했습니다.",
        );
      });
  }

  /**
   * 2단계: 모든 모듈에 대해 세션 생성 흐름 제어
   */
  private populateAllModules(
    structure: PlanStructure,
    context: {
      userId: string;
      materials: Array<MaterialMetadata>;
    },
  ): neverthrow.ResultAsync<Array<GeneratedSession>, AppError> {
    return this.processWithConcurrency(
      structure.modules,
      (module, index) =>
        this.populateSingleModule(
          module,
          index,
          structure.modules.length,
          context,
        ),
      this.CONCURRENCY_LIMIT,
    ).map((results) => this.assignDayOffsets(results.flat()));
  }

  /**
   * 개별 모듈에 대한 세션 생성
   */
  private populateSingleModule(
    module: PlanStructure["modules"][number],
    moduleIndex: number,
    totalModules: number,
    context: {
      userId: string;
      materials: Array<MaterialMetadata>;
    },
  ): neverthrow.ResultAsync<Array<RawPopulatedSession>, AppError> {
    const materialResult = this.resolveMaterialForModule(
      context.materials,
      module,
    );

    return fromPromise(Promise.resolve(materialResult))
      .andThen((result) => result)
      .andThen((material) => {
        const startIndex = Math.max(0, module.chunkRange.start);
        const endIndex = Math.min(
          material.chunkCount - 1,
          module.chunkRange.end,
        );

        return this.ragRetriever
          .retrieveRange({
            userId: context.userId,
            materialId: material.id,
            startIndex,
            endIndex,
          })
          .andThen((chunks) => {
            const chunkContents = chunks.map((c) => c.content);
            if (chunkContents.length === 0) {
              this.logger.error(
                {
                  moduleTitle: module.title,
                  materialId: material.id,
                  requestedRange: module.chunkRange,
                  actualRange: { startIndex, endIndex },
                  materialChunkCount: material.chunkCount,
                },
                "[LearningPlanGenerator] 청크 조회 결과 없음",
              );
              return err(
                new ApiError(
                  500,
                  "EMPTY_MATERIAL_CHUNKS",
                  `모듈 "${module.title}"의 학습 내용을 불러올 수 없습니다. (범위: ${startIndex}-${endIndex}, 전체: ${material.chunkCount})`,
                ),
              );
            }

            const systemPrompt = buildModulePopulationSystemPrompt();
            const userPrompt = buildModulePopulationUserPrompt({
              moduleTitle: module.title,
              moduleDescription: module.description,
              moduleIndex,
              totalModules,
              sessionCount: module.sessionCount,
              chunkContents,
            });

            return getAiModelsAsync()
              .andThen((models) =>
                models.chat.generateStructuredOutput(
                  {
                    config: {
                      systemInstruction: systemPrompt,
                    },
                    contents: [userPrompt],
                  },
                  ModuleSessionsSchema,
                ),
              )
              .mapErr((error) => {
                this.logger.error(
                  { error, moduleTitle: module.title },
                  "[LearningPlanGenerator] AI 모듈 세션 생성 실패",
                );
                return new ApiError(
                  500,
                  "AI_MODULE_POPULATION_FAILED",
                  `모듈 "${module.title}"의 상세 세션을 생성하는 중에 오류가 발생했습니다.`,
                );
              })
              .map((parsed) =>
                parsed.map((sess) => ({
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
                })),
              );
          });
      });
  }

  private resolveMaterialForModule(
    materials: Array<MaterialMetadata>,
    module: PlanStructure["modules"][number],
  ): neverthrow.Result<MaterialMetadata, AppError> {
    const material = materials[module.materialIndex];
    if (!material) {
      return err(
        new ApiError(
          500,
          "MATERIAL_NOT_FOUND",
          `모듈 "${module.title}"에 해당하는 자료를 찾을 수 없습니다.`,
        ),
      );
    }
    return ok(material);
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
  private processWithConcurrency<T, TResult>(
    items: ReadonlyArray<T>,
    processor: (
      item: T,
      index: number,
    ) => neverthrow.ResultAsync<TResult, AppError>,
    concurrency: number,
  ): neverthrow.ResultAsync<Array<TResult>, AppError> {
    const workerCount = Math.min(concurrency, items.length);

    return fromPromise(
      (async () => {
        const results: Array<TResult> = new Array(items.length);
        const state: { nextIndex: number; firstError: AppError | null } = {
          nextIndex: 0,
          firstError: null,
        };

        const processNext = async (): Promise<void> => {
          while (true) {
            if (state.firstError) return;

            const index = state.nextIndex;
            state.nextIndex += 1;
            if (index >= items.length) return;

            const processed = await processor(items[index]!, index);
            if (processed.isErr()) {
              state.firstError = processed.error;
              return;
            }

            results[index] = processed.value;
          }
        };

        await Promise.all(
          Array.from({ length: workerCount }, () => processNext()),
        );

        return state.firstError ? err(state.firstError) : ok(results);
      })(),
    ).andThen((result) => result);
  }

  /**
   * 날짜 오프셋 할당
   */
  private assignDayOffsets(
    sessions: Array<RawPopulatedSession>,
  ): Array<GeneratedSession> {
    const state: { currentDay: number; sessionsOnCurrentDay: number } = {
      currentDay: 0,
      sessionsOnCurrentDay: 0,
    };

    return sessions.map((session) => {
      if (state.sessionsOnCurrentDay >= this.MAX_SESSIONS_PER_DAY) {
        state.currentDay += 1;
        state.sessionsOnCurrentDay = 0;
      }
      state.sessionsOnCurrentDay += 1;
      return {
        sessionType: session.sessionType,
        title: session.title,
        objective: session.objective,
        estimatedMinutes: session.estimatedMinutes,
        moduleIndex: session.moduleIndex,
        sourceReferences: session.sourceReferences,
        dayOffset: state.currentDay,
      };
    });
  }
}

export function createLearningPlanGenerator(
  deps: LearningPlanGeneratorDeps,
): LearningPlanGenerator {
  return new LearningPlanGenerator(deps);
}
