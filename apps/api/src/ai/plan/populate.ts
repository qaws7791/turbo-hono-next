import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { logger } from "../../lib/logger";
import { requireOpenAi } from "../../lib/openai";
import { ApiError } from "../../middleware/error-handler";
import { retrieveChunkRange } from "../rag/retrieve";

import {
  buildModulePopulationSystemPrompt,
  buildModulePopulationUserPrompt,
} from "./prompts";

import type { PlanStructure } from "./structure";
import type { PlanLevel } from "./types";

// ============================================
// 2단계 스키마: 모듈 내 세션 일괄 생성
// ============================================

/**
 * 모듈 내 개별 세션 스키마
 */
const ModuleSessionSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(120)
    .describe("세션 제목 (구체적이고 동기부여가 되는 표현, 120자 이내)"),
  objective: z
    .string()
    .min(1)
    .max(200)
    .describe("학습 목표 (SMART 원칙에 따라 측정 가능하게, 200자 이내)"),
  estimatedMinutes: z
    .number()
    .int()
    .min(25)
    .max(50)
    .describe("예상 학습 시간 (분, 25-50)"),
  chunkStart: z
    .number()
    .int()
    .nonnegative()
    .describe("담당 청크 시작 인덱스 (모듈 내 상대 위치, 0부터)"),
  chunkEnd: z
    .number()
    .int()
    .nonnegative()
    .describe("담당 청크 끝 인덱스 (모듈 내 상대 위치, inclusive)"),
});

/**
 * 2단계 AI 응답 스키마: 모듈 내 세션 배열
 */
const ModuleSessionsSchema = z.object({
  sessions: z
    .array(ModuleSessionSchema)
    .min(1)
    .max(10)
    .describe("모듈 내 세션 목록 (1-10개)"),
});

export type ModuleSessions = z.infer<typeof ModuleSessionsSchema>;

// ============================================
// 출력 타입
// ============================================

export type PopulatedSession = {
  readonly sessionType: "LEARN";
  readonly title: string;
  readonly objective: string;
  readonly estimatedMinutes: number;
  readonly dayOffset: number;
  readonly moduleIndex: number;
  readonly sourceReferences: ReadonlyArray<{
    materialId: string;
    chunkRange: { start: number; end: number };
  }>;
};

export type PopulateContext = {
  readonly userId: string;
  readonly materials: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
  }>;
  readonly currentLevel: PlanLevel;
};

// ============================================
// 내부 타입
// ============================================

type ModuleFromStructure = PlanStructure["modules"][number];

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 동시성 제한을 위한 청크 처리
 */
async function processWithConcurrency<T, TResult>(
  items: ReadonlyArray<T>,
  processor: (item: T, index: number) => Promise<TResult>,
  concurrency: number,
): Promise<Array<TResult>> {
  const results: Array<TResult> = new Array(items.length);
  let currentIndex = 0;

  async function processNext(): Promise<void> {
    while (currentIndex < items.length) {
      const index = currentIndex;
      currentIndex += 1;
      results[index] = await processor(items[index]!, index);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) });
  await Promise.all(workers.map(() => processNext()));

  return results;
}

/**
 * 하루 최대 세션 수 기준으로 dayOffset 할당
 */
function assignDayOffsets(
  sessions: ReadonlyArray<Omit<PopulatedSession, "dayOffset">>,
): ReadonlyArray<PopulatedSession> {
  const MAX_SESSIONS_PER_DAY = 3;
  let currentDay = 0;
  let sessionsOnCurrentDay = 0;

  return sessions.map((session) => {
    if (sessionsOnCurrentDay >= MAX_SESSIONS_PER_DAY) {
      currentDay += 1;
      sessionsOnCurrentDay = 0;
    }
    sessionsOnCurrentDay += 1;
    return { ...session, dayOffset: currentDay };
  });
}

/**
 * 폴백 세션 생성 (AI 호출 실패 시)
 */
function createFallbackSessions(
  module: ModuleFromStructure,
  moduleIndex: number,
  materialId: string | undefined,
): ReadonlyArray<Omit<PopulatedSession, "dayOffset">> {
  const sessionCount = module.sessionCount;
  const chunkRange = module.chunkRange;
  const chunksPerSession = Math.ceil(
    (chunkRange.end - chunkRange.start + 1) / sessionCount,
  );

  return Array.from({ length: sessionCount }, (_, i) => {
    const chunkStart = chunkRange.start + i * chunksPerSession;
    const chunkEnd = Math.min(
      chunkRange.start + (i + 1) * chunksPerSession - 1,
      chunkRange.end,
    );

    return {
      sessionType: "LEARN" as const,
      title: `${module.title} - 세션 ${i + 1}`,
      objective: `${module.description || module.title} 학습을 진행합니다.`,
      estimatedMinutes: 30,
      moduleIndex,
      sourceReferences: materialId
        ? [{ materialId, chunkRange: { start: chunkStart, end: chunkEnd } }]
        : [],
    };
  });
}

// ============================================
// 모듈 단위 세션 생성
// ============================================

/**
 * 2단계: 모듈 내 세션 일괄 생성
 *
 * 한 번의 AI 호출로 모듈 내 모든 세션(최대 10개)을 생성합니다.
 */
async function populateModuleSessions(params: {
  readonly module: ModuleFromStructure;
  readonly moduleIndex: number;
  readonly totalModules: number;
  readonly chunkContents: ReadonlyArray<string>;
  readonly materialId: string;
  readonly currentLevel: PlanLevel;
}): Promise<ReadonlyArray<Omit<PopulatedSession, "dayOffset">>> {
  const openai = requireOpenAi();
  const { module, moduleIndex, totalModules, chunkContents, currentLevel } =
    params;

  const systemPrompt = buildModulePopulationSystemPrompt();
  const userPrompt = buildModulePopulationUserPrompt({
    moduleTitle: module.title,
    moduleDescription: module.description,
    moduleIndex,
    totalModules,
    sessionCount: module.sessionCount,
    chunkContents,
    currentLevel,
  });

  try {
    const response = await openai.responses.parse({
      model: "gpt-5-mini",
      instructions: systemPrompt,
      input: userPrompt,
      text: {
        format: zodTextFormat(ModuleSessionsSchema, "module_sessions"),
      },
    });

    if (!response.output_parsed) {
      throw new ApiError(
        500,
        "AI_GENERATION_FAILED",
        `모듈 "${module.title}" 세션 생성 AI 응답 파싱 실패`,
      );
    }

    const parsedSessions = response.output_parsed.sessions;

    // 세션 수 불일치 경고
    if (parsedSessions.length !== module.sessionCount) {
      logger.warn(
        {
          moduleTitle: module.title,
          expected: module.sessionCount,
          actual: parsedSessions.length,
        },
        "[populateModuleSessions] 세션 수 불일치 - 반환된 세션 사용",
      );
    }

    // 응답을 PopulatedSession 형식으로 변환
    return parsedSessions.map((sess) => ({
      sessionType: "LEARN" as const,
      title: sess.title,
      objective: sess.objective,
      estimatedMinutes: sess.estimatedMinutes,
      moduleIndex,
      sourceReferences: [
        {
          materialId: params.materialId,
          chunkRange: {
            // 모듈 내 상대 인덱스 → 전체 자료 절대 인덱스
            start: module.chunkRange.start + sess.chunkStart,
            end: module.chunkRange.start + sess.chunkEnd,
          },
        },
      ],
    }));
  } catch (error) {
    if (error instanceof ApiError) throw error;

    logger.error(
      { error, moduleTitle: module.title },
      "[populateModuleSessions] AI 호출 실패 - 폴백 사용",
    );

    return createFallbackSessions(module, moduleIndex, params.materialId);
  }
}

// ============================================
// 메인 함수
// ============================================

/**
 * 2단계: 모든 모듈의 세션을 병렬 처리 (동시성 제한)
 *
 * 1단계에서 생성된 구조의 각 모듈에 대해
 * 해당 청크를 조회하고 모듈 내 세션들을 일괄 생성합니다.
 *
 * 변경 사항:
 * - 기존: sessionSkeletons 기반, 세션별 AI 호출
 * - 변경: modules 기반, 모듈별 AI 호출 (호출 횟수 대폭 감소)
 */
export async function populateAllSessions(
  structure: PlanStructure,
  context: PopulateContext,
  options: { concurrency: number } = { concurrency: 3 },
): Promise<ReadonlyArray<PopulatedSession>> {
  const modules = structure.modules;

  logger.info(
    {
      moduleCount: modules.length,
      totalExpectedSessions: modules.reduce(
        (sum, m) => sum + m.sessionCount,
        0,
      ),
    },
    "[populateAllSessions] 모듈별 세션 생성 시작",
  );

  // 모듈별로 AI 호출 (병렬 처리, 동시성 제한)
  const moduleSessionsArray = await processWithConcurrency(
    modules,
    async (module, moduleIndex) => {
      const material = context.materials[module.materialIndex];

      if (!material) {
        logger.warn(
          { moduleIndex, materialIndex: module.materialIndex },
          "[populateAllSessions] 자료 없음 - 폴백 사용",
        );
        return createFallbackSessions(module, moduleIndex, undefined);
      }

      // 해당 모듈의 청크 범위 조회
      let chunkContents: ReadonlyArray<string> = [];
      try {
        const chunks = await retrieveChunkRange({
          userId: context.userId,
          materialId: material.id,
          startIndex: module.chunkRange.start,
          endIndex: module.chunkRange.end,
        });
        chunkContents = chunks.map((c) => c.content);
      } catch (error) {
        logger.warn(
          { error, moduleIndex },
          "[populateAllSessions] 청크 조회 실패 - 폴백 사용",
        );
      }

      if (chunkContents.length === 0) {
        return createFallbackSessions(module, moduleIndex, material.id);
      }

      // 모듈 단위로 AI 호출
      return populateModuleSessions({
        module,
        moduleIndex,
        totalModules: modules.length,
        chunkContents,
        materialId: material.id,
        currentLevel: context.currentLevel,
      });
    },
    options.concurrency,
  );

  // 모든 세션을 하나의 배열로 펼치기
  const allSessionsWithoutDay = moduleSessionsArray.flat();

  // dayOffset 할당 (하루 최대 3세션 기준)
  const allSessions = assignDayOffsets(allSessionsWithoutDay);

  logger.info(
    { totalSessions: allSessions.length },
    "[populateAllSessions] 모듈별 세션 생성 완료",
  );

  return allSessions;
}
