import { useSuspenseQuery } from "@tanstack/react-query";

import type { RoadmapListParams } from "@/features/roadmap/api/roadmap-service";

import { roadmapsQueryOptions } from "@/features/roadmap/api/roadmap-queries";

export function useRoadmapList(params?: RoadmapListParams) {
  return useSuspenseQuery(roadmapsQueryOptions(params));
}
