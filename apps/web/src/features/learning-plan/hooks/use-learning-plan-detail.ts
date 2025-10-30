import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { LearningPlanDetailResponse } from "@/features/learning-plan/api/learning-plan-service";
import type { LearningModule } from "@/features/learning-plan/model/types";

import { learningPlanQueryOptions } from "@/features/learning-plan/api/learning-plan-queries";
import { transformLearningModules } from "@/features/learning-plan/model/learning-module";

type LearningPlanPayload = LearningPlanDetailResponse["data"];

export function useLearningPlanDetail(learningPlanId: string) {
  const query = useQuery(learningPlanQueryOptions(learningPlanId));

  const learningPlan = query.data?.data as LearningPlanPayload;
  const learningModules: Array<LearningModule> = useMemo(() => {
    if (!learningPlan?.learningModules) {
      return [];
    }

    return transformLearningModules(learningPlan.learningModules);
  }, [learningPlan?.learningModules]);

  return {
    ...query,
    learningPlan,
    learningModules,
  };
}
