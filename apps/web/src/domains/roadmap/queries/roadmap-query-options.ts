import { api } from "@/api/http-client";
import { queryOptions } from "@tanstack/react-query";

export const roadmapQueryOptions = (roadmapId: string) =>
  queryOptions({
    queryKey: ["roadmap", roadmapId],
    queryFn: () => api.roadmaps.detail(roadmapId),
  });
