import { z } from "zod";

/**
 * 청크 범위 스키마
 */
export const ChunkRangeSchema = z.object({
  start: z.number().int().nonnegative().describe("청크 시작 인덱스 (0부터)"),
  end: z.number().int().nonnegative().describe("청크 끝 인덱스"),
});

/**
 * 1단계 AI 응답 스키마: 학습 구조
 */
export const PlanStructureSchema = z.object({
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
  reasoning: z
    .string()
    .max(200)
    .describe("모듈/세션 구성을 이렇게 결정한 이유 (1-2문장)"),
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
        sessionCount: z
          .number()
          .int()
          .min(1)
          .max(10)
          .describe("해당 모듈에 배정될 세션 수 (1-10개, 청크 분량에 비례)"),
      }),
    )
    .min(1)
    .describe("학습 모듈 목록 (최소 1개 이상)"),
});

export type PlanStructure = z.infer<typeof PlanStructureSchema>;

/**
 * 모듈 내 개별 세션 스키마
 */
export const ModuleSessionSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(120)
    .describe("세션 제목 (구체적이고 동기부여가 되는 표현, 120자 이내)"),
  objective: z
    .string()
    .min(1)
    .max(300)
    .describe("학습 목표 (SMART 원칙에 따라 측정 가능하게, 300자 이내)"),
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
export const ModuleSessionsSchema = z
  .array(ModuleSessionSchema)
  .min(1)
  .max(10)
  .describe("모듈 내 세션 목록 (1-10개)");

export type ModuleSessions = z.infer<typeof ModuleSessionsSchema>;
