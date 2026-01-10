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
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
});

/**
 * 1단계 AI 응답 스키마: 학습 구조
 */
const PlanStructureSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  sessionCount: z.number().int().min(1).max(90),
  reasoning: z.string(),
  modules: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string(),
      orderIndex: z.number().int().nonnegative(),
      materialIndex: z.number().int().nonnegative(),
      chunkRange: ChunkRangeSchema,
    }),
  ),
  sessionSkeletons: z.array(
    z.object({
      moduleIndex: z.number().int().nonnegative(),
      dayOffset: z.number().int().nonnegative(),
      estimatedMinutes: z.number().int().min(5).max(120),
      chunkRange: ChunkRangeSchema,
      topicHint: z.string(),
    }),
  ),
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
 * 청크 수와 자료 정보만으로 전체 학습 구조를 설계합니다.
 * 각 세션이 담당할 청크 범위를 지정하여 2단계에서 상세화에 사용됩니다.
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

  const completion = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 1,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new ApiError(
      500,
      "AI_GENERATION_FAILED",
      "AI 응답이 없습니다. (구조 설계)",
    );
  }

  try {
    const parsed = JSON.parse(content);
    return PlanStructureSchema.parse(parsed);
  } catch (err) {
    logger.error(
      { err, contentSample: content.slice(0, 500) },
      "[generatePlanStructure] 파싱 실패",
    );
    throw new ApiError(
      500,
      "AI_GENERATION_FAILED",
      "AI 응답을 파싱할 수 없습니다. (구조 설계)",
      { rawContent: content.slice(0, 500) },
    );
  }
}
