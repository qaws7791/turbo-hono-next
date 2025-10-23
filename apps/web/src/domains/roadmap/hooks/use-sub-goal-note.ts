import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { SubGoalNoteStatus } from "@/domains/roadmap/model/types";

import { api } from "@/api/http-client";


interface UseSubGoalNoteParams {
  roadmapId: string;
  subGoalId: string;
  status: SubGoalNoteStatus;
}

export function useSubGoalNote({
  roadmapId,
  subGoalId,
  status,
}: UseSubGoalNoteParams) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (options?: { force?: boolean }) =>
      api.ai.generateSubGoalNote(
        roadmapId,
        subGoalId,
        options?.force ? { force: options.force } : undefined,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["subgoal", roadmapId, subGoalId],
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
