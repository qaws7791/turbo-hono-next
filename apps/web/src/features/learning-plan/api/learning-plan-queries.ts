import { queryOptions } from "@tanstack/react-query";

import type { LearningPlanListParams } from "@/features/learning-plan/api/learning-plan-service";

import {
  getLearningPlanDetail,
  getLearningTaskDetail,
  getLearningTaskNote,
  getLearningTaskQuiz,
  listLearningPlans,
} from "@/features/learning-plan/api/learning-plan-service";
import { learningPlanKeys } from "@/features/learning-plan/api/query-keys";

/**
 * NOTE: Return types are intentionally omitted to allow TypeScript to infer
 * the precise types from queryOptions, which includes specific tuple types
 * for queryKey that cannot be accurately represented with explicit type annotations.
 */
export const learningPlansQueryOptions = (params?: LearningPlanListParams) =>
  queryOptions({
    queryKey: learningPlanKeys.list(params),
    queryFn: () => listLearningPlans(params),
  });

export const learningPlanQueryOptions = (learningPlanId: string) =>
  queryOptions({
    queryKey: learningPlanKeys.detail(learningPlanId),
    queryFn: () => getLearningPlanDetail(learningPlanId),
  });

export const learningTaskDetailQueryOptions = (learningTaskId: string) =>
  queryOptions({
    queryKey: learningPlanKeys.learningTask(learningTaskId),
    queryFn: () => getLearningTaskDetail(learningTaskId),
  });

export const learningTaskNoteQueryOptions = (learningTaskId: string) =>
  queryOptions({
    queryKey: learningPlanKeys.learningTaskNote(learningTaskId),
    queryFn: () => getLearningTaskNote(learningTaskId),
  });

export const learningTaskQuizQueryOptions = (learningTaskId: string) =>
  queryOptions({
    queryKey: learningPlanKeys.learningTaskQuiz(learningTaskId),
    queryFn: () => getLearningTaskQuiz(learningTaskId),
  });
