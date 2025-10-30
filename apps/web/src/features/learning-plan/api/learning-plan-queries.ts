import { queryOptions } from "@tanstack/react-query";

import type { LearningPlanListParams } from "@/features/learning-plan/api/learning-plan-service";

import {
  getLearningPlanDetail,
  getLearningTaskDetail,
  listLearningPlans,
} from "@/features/learning-plan/api/learning-plan-service";
import { learningPlanKeys } from "@/features/learning-plan/api/query-keys";

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

export const learningTaskDetailQueryOptions = (
  learningPlanId: string,
  learningTaskId: string,
) =>
  queryOptions({
    queryKey: learningPlanKeys.learningTask(learningPlanId, learningTaskId),
    queryFn: () => getLearningTaskDetail(learningPlanId, learningTaskId),
  });
