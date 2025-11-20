/**
 * Learning Plan API Response Types
 *
 * OpenAPI 스펙에서 자동 생성된 타입에서 추출한 API 응답 타입
 */

import type { paths } from "@/api/schema";

/**
 * GET /plans/{id} 응답의 learningModules 배열 항목 타입
 */
export type ApiLearningModule =
  paths["/plans/{id}"]["get"]["responses"][200]["content"]["application/json"]["learningModules"][number];

/**
 * Learning Module 내의 Learning Task 타입
 */
export type ApiLearningTask =
  ApiLearningModule["learningTasks"] extends Array<infer T> ? T : never;
