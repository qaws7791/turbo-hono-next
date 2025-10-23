import { useQuery } from "@tanstack/react-query";

import type { SubGoalNoteStatus } from "@/domains/roadmap/model/types";

import { subGoalDetailQueryOptions } from "@/domains/roadmap/hooks/sub-goal-detail-query-options";


const NOTE_REFETCH_INTERVAL_MS = 4000;

export function useSubGoalDetail(roadmapId: string, subGoalId: string) {
  return useQuery({
    ...subGoalDetailQueryOptions(roadmapId, subGoalId),
    refetchInterval: (query) => {
      const noteStatus =
        query.state.data?.data?.aiNoteStatus ?? ("idle" as SubGoalNoteStatus);
      return noteStatus === "processing" ? NOTE_REFETCH_INTERVAL_MS : false;
    },
  });
}
