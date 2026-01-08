import { queryOptions } from "@tanstack/react-query";

import {
  getConceptDetail,
  listConceptLibrary,
  listSpaceConcepts,
} from "./api/concepts.api";

import type { SpaceConceptsList } from "./api/concepts.api";
import type { ConceptSummary } from "./model/concepts.types";

export const conceptsQueries = {
  all: () => ["concepts"] as const,
  lists: () => [...conceptsQueries.all(), "list"] as const,
  details: () => [...conceptsQueries.all(), "detail"] as const,
  libraries: () => [...conceptsQueries.all(), "library"] as const,
  pages: () => [...conceptsQueries.all(), "page"] as const,

  listForSpace: (
    spaceId: string,
    query?: Parameters<typeof listSpaceConcepts>[1],
  ) =>
    queryOptions({
      queryKey: [...conceptsQueries.lists(), spaceId, query ?? null] as const,
      queryFn: (): Promise<SpaceConceptsList> =>
        listSpaceConcepts(spaceId, query),
    }),

  detail: (conceptId: string) =>
    queryOptions({
      queryKey: [...conceptsQueries.details(), conceptId] as const,
      queryFn: () => getConceptDetail(conceptId),
    }),

  library: (query?: Parameters<typeof listConceptLibrary>[0]) => {
    return queryOptions({
      queryKey: [...conceptsQueries.libraries(), query ?? null] as const,
      queryFn: (): Promise<Array<ConceptSummary>> =>
        listConceptLibrary(query).then((res) => res.data),
    });
  },
};
