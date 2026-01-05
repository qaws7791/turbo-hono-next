import { queryOptions } from "@tanstack/react-query";

import { listSpaceMaterials } from "./api/materials.api";

import type { Material } from "./model/materials.types";

export const materialsQueries = {
  all: () => ["materials"] as const,
  lists: () => [...materialsQueries.all(), "list"] as const,
  counts: () => [...materialsQueries.all(), "count"] as const,

  listForSpace: (spaceId: string) =>
    queryOptions({
      queryKey: [...materialsQueries.lists(), spaceId] as const,
      queryFn: async (): Promise<Array<Material>> => {
        const { data } = await listSpaceMaterials(spaceId, {
          page: 1,
          limit: 100,
        });
        return data;
      },
      staleTime: 10_000,
      gcTime: 60_000,
    }),

  countForSpace: (spaceId: string) =>
    queryOptions({
      queryKey: [...materialsQueries.counts(), spaceId] as const,
      queryFn: async (): Promise<number> => {
        const { meta } = await listSpaceMaterials(spaceId, {
          page: 1,
          limit: 1,
        });
        return meta.total;
      },
      staleTime: 10_000,
      gcTime: 60_000,
    }),
};
