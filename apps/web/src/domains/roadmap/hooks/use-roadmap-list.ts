import { useSuspenseQuery } from "@tanstack/react-query";

import { roadmapsQueryOptions } from "@/domains/roadmap/hooks/roadmaps-query-options";

export function useRoadmapList(params?: {
  cursor?: string;
  limit?: number;
  search?: string;
  status?: "active" | "archived";
  sort?: "created_at" | "updated_at" | "title";
  order?: "asc" | "desc";
}) {
  return useSuspenseQuery(roadmapsQueryOptions(params));
}
