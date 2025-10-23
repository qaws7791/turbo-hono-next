import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { SubGoalNoteStatus } from "@/features/roadmap/model/types";

import { generateSubGoalNote } from "@/features/roadmap/api/roadmap-service";
import { roadmapKeys } from "@/features/roadmap/api/query-keys";

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
      generateSubGoalNote(roadmapId, subGoalId, options),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: roadmapKeys.subGoal(roadmapId, subGoalId),
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
