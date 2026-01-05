import { queryOptions } from "@tanstack/react-query";

import type { Space, SpaceCard } from "./model/spaces.types";

import { listSpaceConceptsForUi } from "~/domains/concepts/application";
import { getMaterialCountForSpaceUi } from "~/domains/materials/application";
import { getActivePlanForSpaceUi } from "~/domains/plans/application";
import { getSpaceForUi, listSpacesForUi } from "~/domains/spaces/application";

export const spacesQueries = {
  all: () => ["spaces"] as const,
  lists: () => [...spacesQueries.all(), "list"] as const,
  details: () => [...spacesQueries.all(), "detail"] as const,
  cards: () => [...spacesQueries.all(), "cards"] as const,

  list: () =>
    queryOptions({
      queryKey: spacesQueries.lists(),
      queryFn: (): Promise<Array<Space>> => listSpacesForUi(),
      staleTime: 10_000,
      gcTime: 60_000,
    }),

  detail: (spaceId: string) =>
    queryOptions({
      queryKey: [...spacesQueries.details(), spaceId] as const,
      queryFn: (): Promise<Awaited<ReturnType<typeof getSpaceForUi>>> =>
        getSpaceForUi(spaceId),
      staleTime: 10_000,
      gcTime: 60_000,
    }),

  listCards: () =>
    queryOptions({
      queryKey: spacesQueries.cards(),
      queryFn: async (): Promise<Array<SpaceCard>> => {
        const spaces = await listSpacesForUi();

        const cards: Array<SpaceCard> = await Promise.all(
          spaces.map(async (space) => {
            const [materialCount, concepts, activePlan] = await Promise.all([
              getMaterialCountForSpaceUi(space.id),
              listSpaceConceptsForUi(space.id, { page: 1, limit: 1 }),
              getActivePlanForSpaceUi(space.id),
            ]);

            const lastStudiedAt = concepts.data[0]?.lastStudiedAt;

            return {
              id: space.id,
              name: space.name,
              description: space.description,
              icon: space.icon,
              color: space.color,
              hasTodo: Boolean(activePlan && activePlan.progressPercent < 100),
              materialCount,
              conceptCount: concepts.meta.total,
              lastStudiedAt,
              activePlan: activePlan
                ? {
                    id: activePlan.id,
                    title: activePlan.title,
                    progressPercent: activePlan.progressPercent,
                  }
                : undefined,
            };
          }),
        );

        return cards;
      },
      staleTime: 10_000,
      gcTime: 60_000,
    }),
};
