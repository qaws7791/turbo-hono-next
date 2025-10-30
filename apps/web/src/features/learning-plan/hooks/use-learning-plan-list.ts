import { useSuspenseQuery } from "@tanstack/react-query";

import type { LearningPlanListParams } from "@/features/learning-plan/api/learning-plan-service";

import { learningPlansQueryOptions } from "@/features/learning-plan/api/learning-plan-queries";

export function useLearningPlanList(params?: LearningPlanListParams) {
  return useSuspenseQuery(learningPlansQueryOptions(params));
}
