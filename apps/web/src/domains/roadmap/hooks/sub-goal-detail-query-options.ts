import { queryOptions } from "@tanstack/react-query";

import { api } from "@/api/http-client";

export const subGoalDetailQueryOptions = (
  roadmapId: string,
  subGoalId: string,
) =>
  queryOptions({
    queryKey: ["subgoal", roadmapId, subGoalId],
    queryFn: () => api.subGoals.detail(roadmapId, subGoalId),
  });
