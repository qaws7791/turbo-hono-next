import { queryOptions } from "@tanstack/react-query";

import { getConceptDetail, listSpaceConcepts } from "./api/concepts.api";

import type { Space } from "~/domains/spaces/model/spaces.types";
import type { SpaceConceptsList } from "./api/concepts.api";
import type { Concept } from "./model/concepts.types";

import { getSpace, listSpaces } from "~/domains/spaces/api/spaces.api";

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

  detail: (spaceId: string, conceptId: string) =>
    queryOptions({
      queryKey: [...conceptsQueries.details(), spaceId, conceptId] as const,
      queryFn: () => getConceptDetail(spaceId, conceptId),
    }),

  library: () => {
    return queryOptions({
      queryKey: [...conceptsQueries.libraries()] as const,
      queryFn: async (): Promise<Array<Concept>> => {
        const spaces = await listSpaces();
        const conceptLists = await Promise.all(
          spaces.map((space) =>
            listSpaceConcepts(space.id, {
              page: 1,
              limit: 50,
            }),
          ),
        );

        return conceptLists.flatMap((list) => list.data);
      },
    });
  },

  detailPage: (conceptId: string) =>
    queryOptions({
      queryKey: [...conceptsQueries.pages(), "detail", conceptId] as const,
      queryFn: async (): Promise<{
        concept: Concept;
        space: Space;
        related: Array<Concept>;
      }> => {
        const spaces = await listSpaces();
        const conceptLists = await Promise.all(
          spaces.map((space) =>
            listSpaceConcepts(space.id, { page: 1, limit: 200 }),
          ),
        );

        const index = new Map<string, Concept>();
        for (const list of conceptLists) {
          for (const item of list.data) {
            index.set(item.id, item);
          }
        }

        const located = index.get(conceptId);
        if (!located) {
          throw new Response("Not Found", { status: 404 });
        }

        const space = await getSpace(located.spaceId);
        const detail = await getConceptDetail(located.spaceId, conceptId);
        const concept = detail.concept;

        const related = detail.relatedConcepts.slice(0, 6).map((r) => {
          const found = index.get(r.id);
          if (found) return found;

          const fallback: Concept = {
            id: r.id,
            spaceId: concept.spaceId,
            title: r.title,
            oneLiner: "",
            definition: "",
            exampleCode: undefined,
            gotchas: [],
            tags: [],
            reviewStatus: "good",
            lastStudiedAt: undefined,
            sources: [],
            relatedConceptIds: [],
          };
          return fallback;
        });

        return { concept, space, related };
      },
    }),
};
