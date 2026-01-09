import { z } from "zod";

import { requireOpenAi } from "../../lib/openai";
import { ApiError } from "../../middleware/error-handler";
import { retrieveTopChunks } from "../rag/retrieve";

import { buildSystemPrompt, buildUserPrompt } from "./prompts";

import type {
  GeneratePlanInput,
  GeneratePlanResult,
  GeneratedModule,
  GeneratedSession,
  MaterialContext,
} from "./types";

/**
 * AI 응답 JSON 스키마
 */
const AiPlanResponseSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  modules: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string(),
      orderIndex: z.number().int().nonnegative(),
      materialIndex: z.number().int().nonnegative(),
    }),
  ),
  sessions: z.array(
    z.object({
      sessionType: z.enum(["LEARN", "REVIEW"]),
      title: z.string().min(1),
      objective: z.string().min(1),
      estimatedMinutes: z.number().int().min(5).max(120),
      dayOffset: z.number().int().nonnegative(),
      moduleIndex: z.number().int().nonnegative(),
    }),
  ),
});

type AiPlanResponse = z.infer<typeof AiPlanResponseSchema>;

/**
 * 각 자료에서 RAG를 통해 관련 청크를 검색
 */
async function fetchMaterialContexts(params: {
  readonly userId: string;
  readonly materialIds: ReadonlyArray<string>;
  readonly goalType: string;
  readonly currentLevel: string;
}): Promise<ReadonlyArray<MaterialContext>> {
  // 학습 목표와 수준을 기반으로 검색 쿼리 생성
  const searchQuery = `${params.goalType} 학습을 위한 핵심 개념, 주요 내용, ${params.currentLevel} 수준에 적합한 설명`;

  const results = await retrieveTopChunks({
    userId: params.userId,
    materialIds: params.materialIds,
    query: searchQuery,
    topK: 20, // 자료당 충분한 컨텍스트 확보
  });

  return results.map((result) => ({
    materialId: result.metadata.materialId,
    materialTitle: result.metadata.materialTitle,
    content: result.content,
    chunkIndex: result.metadata.chunkIndex,
  }));
}

/**
 * 자료별로 컨텍스트를 그룹화
 */
function groupContextsByMaterial(
  contexts: ReadonlyArray<MaterialContext>,
  materialIds: ReadonlyArray<string>,
): ReadonlyArray<{
  readonly materialId: string;
  readonly materialTitle: string;
  readonly content: string;
}> {
  return materialIds.map((materialId) => {
    const materialContexts = contexts.filter(
      (ctx) => ctx.materialId === materialId,
    );

    if (materialContexts.length === 0) {
      return {
        materialId,
        materialTitle: "Unknown Material",
        content: "(자료 내용을 가져올 수 없습니다)",
      };
    }

    // 청크 인덱스 순으로 정렬하여 연결
    const sorted = [...materialContexts].sort(
      (a, b) => a.chunkIndex - b.chunkIndex,
    );

    return {
      materialId,
      materialTitle: sorted[0]!.materialTitle,
      content: sorted.map((ctx) => ctx.content).join("\n\n"),
    };
  });
}

/**
 * OpenAI를 호출하여 학습 계획 생성
 */
async function callOpenAiForPlan(params: {
  readonly systemPrompt: string;
  readonly userPrompt: string;
}): Promise<AiPlanResponse> {
  const openai = requireOpenAi();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new ApiError(500, "AI_GENERATION_FAILED", "AI 응답이 없습니다.");
  }

  try {
    const parsed = JSON.parse(content);
    return AiPlanResponseSchema.parse(parsed);
  } catch {
    throw new ApiError(
      500,
      "AI_GENERATION_FAILED",
      "AI 응답을 파싱할 수 없습니다.",
      { rawContent: content.slice(0, 500) },
    );
  }
}

/**
 * AI 응답을 최종 결과 형태로 변환
 */
function transformAiResponse(
  response: AiPlanResponse,
  materialIds: ReadonlyArray<string>,
): GeneratePlanResult {
  const modules: Array<GeneratedModule> = response.modules.map((mod) => ({
    title: mod.title,
    description: mod.description,
    orderIndex: mod.orderIndex,
    materialId: materialIds[mod.materialIndex] ?? materialIds[0]!,
  }));

  const sessions: Array<GeneratedSession> = response.sessions.map((sess) => ({
    sessionType: sess.sessionType,
    title: sess.title,
    objective: sess.objective,
    estimatedMinutes: sess.estimatedMinutes,
    dayOffset: sess.dayOffset,
    moduleIndex: Math.min(sess.moduleIndex, modules.length - 1),
  }));

  return {
    title: response.title,
    summary: response.summary,
    modules,
    sessions,
  };
}

/**
 * AI 기반 개인화된 학습 계획 생성
 *
 * 1. RAG를 통해 각 자료에서 관련 컨텍스트 검색
 * 2. 사용자 수준과 목표에 맞는 프롬프트 생성
 * 3. OpenAI를 통해 개인화된 학습 계획 생성
 */
export async function generatePlanWithAi(
  input: GeneratePlanInput,
): Promise<GeneratePlanResult> {
  // 1. RAG를 통해 자료 컨텍스트 검색
  const rawContexts = await fetchMaterialContexts({
    userId: input.userId,
    materialIds: input.materialIds,
    goalType: input.goalType,
    currentLevel: input.currentLevel,
  });

  // 2. 자료별로 컨텍스트 그룹화
  const groupedContexts = groupContextsByMaterial(
    rawContexts,
    input.materialIds,
  );

  // 3. 프롬프트 생성
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt({
    goalType: input.goalType,
    currentLevel: input.currentLevel,
    targetDueDate: input.targetDueDate,
    specialRequirements: input.specialRequirements,
    materialContexts: groupedContexts.map((g) => ({
      materialTitle: g.materialTitle,
      content: g.content,
    })),
    materialCount: input.materialIds.length,
  });

  // 4. OpenAI 호출
  const aiResponse = await callOpenAiForPlan({
    systemPrompt,
    userPrompt,
  });

  // 5. 결과 변환 및 반환
  return transformAiResponse(aiResponse, input.materialIds);
}
