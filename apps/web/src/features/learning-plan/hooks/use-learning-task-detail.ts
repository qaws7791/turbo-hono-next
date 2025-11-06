import { useQuery } from "@tanstack/react-query";

import { learningTaskDetailQueryOptions } from "@/features/learning-plan/api/learning-plan-queries";

export function useLearningTaskDetail(learningTaskId: string) {
  return useQuery(learningTaskDetailQueryOptions(learningTaskId));
}
