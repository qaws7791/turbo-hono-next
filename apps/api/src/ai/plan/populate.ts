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
 */
const SessionDetailSchema = z.object({
  title: z.string().min(1),
  objective: z.string().min(1),
});

export type SessionDetail = z.infer<typeof SessionDetailSchema>;

export type PopulatedSession = {
  readonly sessionType: "LEARN";
  readonly title: string;
  readonly objective: string;
  readonly estimatedMinutes: number;
  readonly dayOffset: number;
  readonly moduleIndex: number;
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

  const completion = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new ApiError(
      500,
      "AI_GENERATION_FAILED",
      `세션 ${input.sessionIndex + 1} 상세화 AI 응답이 없습니다.`,
    );
  }

  try {
    const parsed = JSON.parse(content);
    return SessionDetailSchema.parse(parsed);
  } catch (err) {
    throw new ApiError(
      500,
      "AI_GENERATION_FAILED",
      `세션 ${input.sessionIndex + 1} 상세화 응답 파싱 실패`,
      { rawContent: content.slice(0, 200), error: String(err) },
    );
  }
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
      };
    },
    options.concurrency,
  );

  return sessions;
}
