import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { Goal } from "@/domains/roadmap/model/types";

import { roadmapQueryOptions } from "@/domains/roadmap/hooks/roadmap-query-options";
import { transformGoals } from "@/domains/roadmap/model/goal";


export function useRoadmapDetail(roadmapId: string) {
  const query = useQuery(roadmapQueryOptions(roadmapId));

  const roadmap = query.data?.data;
  const goals: Array<Goal> = useMemo(() => {
    if (!roadmap?.goals) {
      return [];
    }

    return transformGoals(roadmap.goals);
  }, [roadmap?.goals]);

  return {
    ...query,
    roadmap,
    goals,
  };
}
