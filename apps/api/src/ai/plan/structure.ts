import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { logger } from "../../lib/logger";
import { requireOpenAi } from "../../lib/openai";
import { ApiError } from "../../middleware/error-handler";

import {
  buildStructurePlanningSystemPrompt,
  buildStructurePlanningUserPrompt,
} from "./prompts";

import type { PlanGoalType, PlanLevel } from "./types";

/**
 * 청크 범위 스키마
 */
const ChunkRangeSchema = z.object({
  start: z.number().int().nonnegative().describe("청크 시작 인덱스 (0부터)"),
  end: z.number().int().nonnegative().describe("청크 끝 인덱스"),
});

/**
 * 1단계 AI 응답 스키마: 학습 구조
 * 길이 제한을 명시하여 AI가 스키마를 준수하도록 함
 */
const PlanStructureSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(100)
    .describe("계획 제목 (예: JavaScript 기초 마스터하기)"),
  summary: z
    .string()
    .min(1)
    .max(300)
    .describe("계획 요약 (2-3문장, 300자 이내)"),
  sessionCount: z.number().int().min(1).max(90).describe("총 세션 수 (1-90)"),
  reasoning: z
    .string()
    .max(200)
    .describe("세션 수를 이렇게 결정한 이유 (1-2문장)"),
  modules: z
    .array(
      z.object({
        title: z.string().min(1).max(100).describe("모듈 제목"),
        description: z.string().max(200).describe("모듈 설명"),
        orderIndex: z
          .number()
          .int()
          .nonnegative()
          .describe("모듈 순서 (0부터)"),
        materialIndex: z
          .number()
          .int()
          .nonnegative()
          .describe("0부터 시작하는 자료 인덱스 (자료 순서 그대로)"),
        chunkRange: ChunkRangeSchema.describe("해당 모듈이 담당하는 청크 범위"),
      }),
    )
    .describe("학습 모듈 목록"),
  sessionSkeletons: z
    .array(
      z.object({
        moduleIndex: z
          .number()
          .int()
          .nonnegative()
          .describe("해당 세션이 속한 모듈의 인덱스"),
        dayOffset: z
          .number()
          .int()
          .nonnegative()
          .describe("오늘(0)부터 시작하는 일 수"),
        estimatedMinutes: z
          .number()
          .int()
          .min(5)
          .max(120)
          .describe("예상 학습 시간 (분)"),
        chunkRange: ChunkRangeSchema.describe(
          "해당 세션이 담당하는 청크 범위 (materialIndex 기준)",
        ),
        topicHint: z
          .string()
          .max(100)
          .describe("해당 세션의 주제 힌트 (2단계에서 상세화에 사용)"),
      }),
    )
    .describe("학습 세션 스켈레톤 목록"),
});

export type PlanStructure = z.infer<typeof PlanStructureSchema>;

export type StructurePlanningInput = {
  readonly goalType: PlanGoalType;
  readonly currentLevel: PlanLevel;
  readonly targetDueDate: Date;
  readonly specialRequirements: string | null;
  readonly requestedSessionCount: number | null;
  readonly materials: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly chunkCount: number;
  }>;
};

/**
 * 1단계: 자료 메타정보 기반 학습 구조 설계
 *
 * OpenAI Structured Outputs를 사용하여 스키마 준수 보장
 * 청크 수와 자료 정보만으로 전체 학습 구조를 설계합니다.
 */
export async function generatePlanStructure(
  input: StructurePlanningInput,
): Promise<PlanStructure> {
  const openai = requireOpenAi();

  const totalChunkCount = input.materials.reduce(
    (sum, mat) => sum + mat.chunkCount,
    0,
  );

  const systemPrompt = buildStructurePlanningSystemPrompt();
  const userPrompt = buildStructurePlanningUserPrompt({
    goalType: input.goalType,
    currentLevel: input.currentLevel,
    targetDueDate: input.targetDueDate,
    specialRequirements: input.specialRequirements,
    requestedSessionCount: input.requestedSessionCount,
    materials: input.materials.map((mat) => ({
      title: mat.title,
      chunkCount: mat.chunkCount,
    })),
    totalChunkCount,
  });

  try {
    const response = await openai.responses.parse({
      model: "gpt-5-mini",
      instructions: systemPrompt,
      input: userPrompt,
      text: {
        format: zodTextFormat(PlanStructureSchema, "plan_structure"),
      },
    });

    if (!response.output_parsed) {
      throw new ApiError(
        500,
        "AI_GENERATION_FAILED",
        "AI 응답을 파싱할 수 없습니다. (구조 설계)",
      );
    }

    return response.output_parsed;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error({ err }, "[generatePlanStructure] AI 구조 설계 실패");
    throw new ApiError(
      500,
      "AI_GENERATION_FAILED",
      "AI 응답을 파싱할 수 없습니다. (구조 설계)",
      { error: String(err) },
    );
  }
}
