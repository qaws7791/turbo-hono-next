import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { Goal } from "@/features/roadmap/model/types";
import type { RoadmapDetailResponse } from "@/features/roadmap/api/roadmap-service";

import { roadmapQueryOptions } from "@/features/roadmap/api/roadmap-queries";
import { transformGoals } from "@/features/roadmap/model/goal";

type RoadmapPayload = RoadmapDetailResponse["data"];

export function useRoadmapDetail(roadmapId: string) {
  const query = useQuery(roadmapQueryOptions(roadmapId));

  const roadmap = query.data?.data as RoadmapPayload;
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
