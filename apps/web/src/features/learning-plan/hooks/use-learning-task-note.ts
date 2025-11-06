import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { LearningTaskNoteStatus } from "@/features/learning-plan/model/types";

import { generateLearningTaskNote } from "@/features/learning-plan/api/learning-plan-service";
import { learningTaskNoteQueryOptions } from "@/features/learning-plan/api/learning-plan-queries";
import { learningPlanKeys } from "@/features/learning-plan/api/query-keys";

const NOTE_REFETCH_INTERVAL_MS = 4000;

interface UseLearningTaskNoteParams {
  learningTaskId: string;
}

export function useLearningTaskNote({
  learningTaskId,
}: UseLearningTaskNoteParams) {
  const queryClient = useQueryClient();

  const noteQuery = useQuery({
    ...learningTaskNoteQueryOptions(learningTaskId),
    refetchInterval: (query) => {
      const status = (query.state.data?.data?.status ??
        "idle") as LearningTaskNoteStatus;
      return status === "processing" ? NOTE_REFETCH_INTERVAL_MS : false;
    },
  });

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (options?: { force?: boolean }) =>
      generateLearningTaskNote(learningTaskId, options),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: learningPlanKeys.learningTaskNote(learningTaskId),
      });
    },
  });

  const status = (noteQuery.data?.data?.status ??
    "idle") as LearningTaskNoteStatus;
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
    noteData: noteQuery.data?.data,
    isLoading: noteQuery.isLoading,
    generateNote,
    isProcessing,
    errorMessage,
  };
}
