import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { LearningTaskNoteStatus } from "@/features/learning-plan/model/types";

import { generateLearningTaskNote } from "@/features/learning-plan/api/learning-plan-service";
import { learningPlanKeys } from "@/features/learning-plan/api/query-keys";

interface UseLearningTaskNoteParams {
  learningPlanId: string;
  learningTaskId: string;
  status: LearningTaskNoteStatus;
}

export function useLearningTaskNote({
  learningPlanId,
  learningTaskId,
  status,
}: UseLearningTaskNoteParams) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (options?: { force?: boolean }) =>
      generateLearningTaskNote(learningPlanId, learningTaskId, options),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: learningPlanKeys.learningTask(learningPlanId, learningTaskId),
      });
    },
  });

  const isProcessing = status === "processing" || isPending;

  const generateNote = useCallback(
    async (force?: boolean) => {
      if (isProcessing) {
        return;
      }

      await mutateAsync(force ? { force: true } : undefined);
    },
    [isProcessing, mutateAsync],
  );

  const errorMessage = error instanceof Error ? error.message : null;

  return {
    generateNote,
    isProcessing,
    errorMessage,
  };
}
