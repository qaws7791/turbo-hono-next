import { queryOptions } from "@tanstack/react-query";

import { api } from "@/api/http-client";

export const roadmapQueryOptions = (roadmapId: string) =>
  queryOptions({
    queryKey: ["roadmap", roadmapId],
    queryFn: () => api.roadmaps.detail(roadmapId),
  });
