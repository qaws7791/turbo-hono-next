import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { logger } from "../../lib/logger";
import { requireOpenAi } from "../../lib/openai";
import { ApiError } from "../../middleware/error-handler";
import { retrieveChunkRange } from "../rag/retrieve";

import {
  buildSessionPopulationSystemPrompt,
  buildSessionPopulationUserPrompt,
} from "./prompts";

import type { PlanStructure } from "./structure";
import type { PlanLevel } from "./types";

/**
 * 2단계 AI 응답 스키마: 세션 상세
 * - title: 120자 이내
 * - objective: 200자 이내 (learningGoals 제한과 일치)
 */
const SessionDetailSchema = z.object({
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
});

export type SessionDetail = z.infer<typeof SessionDetailSchema>;

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

type SessionPopulationInput = {
  readonly moduleTitle: string;
  readonly sessionIndex: number;
  readonly totalSessions: number;
  readonly topicHint: string;
  readonly chunkContents: ReadonlyArray<string>;
  readonly currentLevel: PlanLevel;
};

/**
 * 2단계: 개별 세션 상세 내용 생성
 * OpenAI Structured Outputs를 사용하여 스키마 준수 보장
 */
async function populateSessionDetail(
  input: SessionPopulationInput,
): Promise<SessionDetail> {
  const openai = requireOpenAi();

  const systemPrompt = buildSessionPopulationSystemPrompt();
  const userPrompt = buildSessionPopulationUserPrompt({
    moduleTitle: input.moduleTitle,
    sessionIndex: input.sessionIndex,
    totalSessions: input.totalSessions,
    topicHint: input.topicHint,
    chunkContents: input.chunkContents,
    currentLevel: input.currentLevel,
  });

  const response = await openai.responses.parse({
    model: "gpt-5-mini",
    instructions: systemPrompt,
    input: userPrompt,
    text: {
      format: zodTextFormat(SessionDetailSchema, "session_detail"),
    },
  });

  if (!response.output_parsed) {
    throw new ApiError(
      500,
      "AI_GENERATION_FAILED",
      `세션 ${input.sessionIndex + 1} 상세화 AI 응답 파싱 실패`,
    );
  }

  return response.output_parsed;
}

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

export type PopulateContext = {
  readonly userId: string;
  readonly materials: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
  }>;
  readonly currentLevel: PlanLevel;
};

/**
 * 2단계: 모든 세션 병렬 처리 (동시성 제한)
 *
 * 1단계에서 생성된 구조의 각 세션에 대해
 * 해당 청크를 조회하고 상세 내용을 생성합니다.
 */
export async function populateAllSessions(
  structure: PlanStructure,
  context: PopulateContext,
  options: { concurrency: number } = { concurrency: 5 },
): Promise<ReadonlyArray<PopulatedSession>> {
  const skeletons = structure.sessionSkeletons;

  const sessions = await processWithConcurrency(
    skeletons,
    async (skeleton, sessionIndex) => {
      // 해당 모듈과 자료 정보 찾기
      const module = structure.modules[skeleton.moduleIndex];
      if (!module) {
        return {
          sessionType: "LEARN" as const,
          title: `세션 ${sessionIndex + 1}`,
          objective: "학습을 진행합니다.",
          estimatedMinutes: skeleton.estimatedMinutes,
          dayOffset: skeleton.dayOffset,
          moduleIndex: skeleton.moduleIndex,
          sourceReferences: [],
        };
      }

      const material = context.materials[module.materialIndex];
      if (!material) {
        return {
          sessionType: "LEARN" as const,
          title: skeleton.topicHint || `세션 ${sessionIndex + 1}`,
          objective: `${module.title} 학습을 진행합니다.`,
          estimatedMinutes: skeleton.estimatedMinutes,
          dayOffset: skeleton.dayOffset,
          moduleIndex: skeleton.moduleIndex,
          sourceReferences: [],
        };
      }

      // 해당 청크 범위의 내용 조회
      let chunkContents: ReadonlyArray<string> = [];
      try {
        const chunks = await retrieveChunkRange({
          userId: context.userId,
          materialId: material.id,
          startIndex: skeleton.chunkRange.start,
          endIndex: skeleton.chunkRange.end,
        });
        chunkContents = chunks.map((c) => c.content);
      } catch (error) {
        logger.warn(
          { error, sessionIndex },
          "[populateAllSessions] 청크 조회 실패",
        );
      }

      // 청크가 없으면 기본값 사용
      if (chunkContents.length === 0) {
        return {
          sessionType: "LEARN" as const,
          title: skeleton.topicHint || `세션 ${sessionIndex + 1}`,
          objective: `${module.title} 학습을 진행합니다.`,
          estimatedMinutes: skeleton.estimatedMinutes,
          dayOffset: skeleton.dayOffset,
          moduleIndex: skeleton.moduleIndex,
          sourceReferences: [
            { materialId: material.id, chunkRange: skeleton.chunkRange },
          ],
        };
      }

      // AI로 세션 상세화
      const detail = await populateSessionDetail({
        moduleTitle: module.title,
        sessionIndex,
        totalSessions: skeletons.length,
        topicHint: skeleton.topicHint,
        chunkContents,
        currentLevel: context.currentLevel,
      });

      return {
        sessionType: "LEARN" as const,
        title: detail.title,
        objective: detail.objective,
        estimatedMinutes: skeleton.estimatedMinutes,
        dayOffset: skeleton.dayOffset,
        moduleIndex: skeleton.moduleIndex,
        sourceReferences: [
          { materialId: material.id, chunkRange: skeleton.chunkRange },
        ],
      };
    },
    options.concurrency,
  );

  return sessions;
}
