import { useQuery } from "@tanstack/react-query";

import type { LearningTaskNoteStatus } from "@/features/learning-plan/model/types";
import type { LearningTaskDetailResponse } from "@/features/learning-plan/api/learning-plan-service";

import { learningTaskDetailQueryOptions } from "@/features/learning-plan/api/learning-plan-queries";

const NOTE_REFETCH_INTERVAL_MS = 4000;

type LearningTaskDetailPayload = LearningTaskDetailResponse["data"];

export function useLearningTaskDetail(
  learningPlanId: string,
  learningTaskId: string,
) {
  return useQuery({
    ...learningTaskDetailQueryOptions(learningPlanId, learningTaskId),
    refetchInterval: (query) => {
      const noteStatus = ((
        query.state.data?.data as LearningTaskDetailPayload | undefined
      )?.aiNoteStatus ?? "idle") as LearningTaskNoteStatus;
      return noteStatus === "processing" ? NOTE_REFETCH_INTERVAL_MS : false;
    },
  });
}
