import React from "react";

import { transformFunnelDataToApiFormat } from "../components/learning-plan-funnel/utils";

import type {
  FunnelData,
  LearningPlanFunnelProps,
} from "@/features/learning-plan/model/types";

import { logger } from "@/shared/utils";

const funnelLogger = logger.createScoped("LearningPlanFunnel");

interface UseLearningPlanCreationReturn {
  isCreating: boolean;
  error: string | null;
  handleCreateLearningPlan: (funnelData: FunnelData) => Promise<void>;
}

/**
 * 학습 계획 생성 프로세스를 관리하는 훅
 */
export const useLearningPlanCreation = (
  onSubmit: LearningPlanFunnelProps["onSubmit"],
): UseLearningPlanCreationReturn => {
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCreateLearningPlan = React.useCallback(
    async (funnelData: FunnelData) => {
      try {
        setIsCreating(true);
        setError(null);

        // Transform funnel data to match AI API format
        const apiData = transformFunnelDataToApiFormat(funnelData);
        onSubmit(apiData);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "알 수 없는 오류가 발생했습니다.";
        setError(errorMessage);
        funnelLogger.error(
          "Failed to create learning plan",
          err instanceof Error ? err : new Error(String(err)),
          { funnelData },
        );
      } finally {
        setIsCreating(false);
      }
    },
    [onSubmit],
  );

  return {
    isCreating,
    error,
    handleCreateLearningPlan,
  };
};
