import { api } from "@/api/http-client";
import { queryOptions } from "@tanstack/react-query";

export const roadmapsQueryOptions = (params?: {
  cursor?: string;
  limit?: number;
  search?: string;
  status?: "active" | "archived";
  sort?: "created_at" | "updated_at" | "title";
  order?: "asc" | "desc";
}) =>
  queryOptions({
    queryKey: ["roadmaps", params],
    queryFn: () => api.roadmaps.list(params),
  });
