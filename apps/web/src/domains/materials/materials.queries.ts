import { queryOptions } from "@tanstack/react-query";

import { getMaterialCountForSpaceUi, listMaterialsForUi } from "./application";

import type { Material } from "./model/materials.types";

export const materialsQueries = {
  all: () => ["materials"] as const,
  lists: () => [...materialsQueries.all(), "list"] as const,
  counts: () => [...materialsQueries.all(), "count"] as const,

  listForSpace: (spaceId: string) =>
    queryOptions({
      queryKey: [...materialsQueries.lists(), spaceId] as const,
      queryFn: (): Promise<Array<Material>> => listMaterialsForUi(spaceId),
      staleTime: 10_000,
      gcTime: 60_000,
    }),

  countForSpace: (spaceId: string) =>
    queryOptions({
      queryKey: [...materialsQueries.counts(), spaceId] as const,
      queryFn: (): Promise<number> => getMaterialCountForSpaceUi(spaceId),
      staleTime: 10_000,
      gcTime: 60_000,
    }),
};
