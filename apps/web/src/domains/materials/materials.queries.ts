import { queryOptions } from "@tanstack/react-query";

import { listMaterials } from "./api/materials.api";

import type { Material } from "./model/materials.types";

export const materialsQueries = {
  all: () => ["materials"] as const,
  lists: () => [...materialsQueries.all(), "list"] as const,
  counts: () => [...materialsQueries.all(), "count"] as const,

  list: (query?: { page?: number; limit?: number }) =>
    queryOptions({
      queryKey: [...materialsQueries.lists(), query] as const,
      queryFn: async (): Promise<Array<Material>> => {
        const { data } = await listMaterials({
          page: query?.page ?? 1,
          limit: query?.limit ?? 100,
        });
        return data;
      },
    }),

  count: () =>
    queryOptions({
      queryKey: [...materialsQueries.counts()] as const,
      queryFn: async (): Promise<number> => {
        const { meta } = await listMaterials({
          page: 1,
          limit: 1,
        });
        return meta.total;
      },
    }),
};
