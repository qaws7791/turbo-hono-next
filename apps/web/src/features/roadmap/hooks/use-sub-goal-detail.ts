import { useQuery } from "@tanstack/react-query";

import type { SubGoalNoteStatus } from "@/features/roadmap/model/types";
import type { SubGoalDetailResponse } from "@/features/roadmap/api/roadmap-service";

import { subGoalDetailQueryOptions } from "@/features/roadmap/api/roadmap-queries";

const NOTE_REFETCH_INTERVAL_MS = 4000;

type SubGoalDetailPayload = SubGoalDetailResponse["data"];

export function useSubGoalDetail(roadmapId: string, subGoalId: string) {
  return useQuery({
    ...subGoalDetailQueryOptions(roadmapId, subGoalId),
    refetchInterval: (query) => {
      const noteStatus = ((
        query.state.data?.data as SubGoalDetailPayload | undefined
      )?.aiNoteStatus ?? "idle") as SubGoalNoteStatus;
      return noteStatus === "processing" ? NOTE_REFETCH_INTERVAL_MS : false;
    },
  });
}
