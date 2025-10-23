import { queryOptions } from "@tanstack/react-query";

import type { RoadmapListParams } from "@/features/roadmap/api/roadmap-service";

import {
  getRoadmapDetail,
  getSubGoalDetail,
  listRoadmaps,
} from "@/features/roadmap/api/roadmap-service";
import { roadmapKeys } from "@/features/roadmap/api/query-keys";

export const roadmapsQueryOptions = (params?: RoadmapListParams) =>
  queryOptions({
    queryKey: roadmapKeys.list(params),
    queryFn: () => listRoadmaps(params),
  });

export const roadmapQueryOptions = (roadmapId: string) =>
  queryOptions({
    queryKey: roadmapKeys.detail(roadmapId),
    queryFn: () => getRoadmapDetail(roadmapId),
  });

export const subGoalDetailQueryOptions = (
  roadmapId: string,
  subGoalId: string,
) =>
  queryOptions({
    queryKey: roadmapKeys.subGoal(roadmapId, subGoalId),
    queryFn: () => getSubGoalDetail(roadmapId, subGoalId),
  });
