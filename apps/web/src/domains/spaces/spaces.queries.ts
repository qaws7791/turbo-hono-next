import { queryOptions } from "@tanstack/react-query";

import type { Space, SpaceCard } from "./model/spaces.types";

import {
  getSpace,
  listSpaces,
  listSpacesWithCards,
} from "~/domains/spaces/api/spaces.api";

export const spacesQueries = {
  all: () => ["spaces"] as const,
  lists: () => [...spacesQueries.all(), "list"] as const,
  details: () => [...spacesQueries.all(), "detail"] as const,
  cards: () => [...spacesQueries.all(), "cards"] as const,

  list: () =>
    queryOptions({
      queryKey: spacesQueries.lists(),
      queryFn: (): Promise<Array<Space>> => listSpaces(),
    }),

  detail: (spaceId: string) =>
    queryOptions({
      queryKey: [...spacesQueries.details(), spaceId] as const,
      queryFn: (): Promise<Awaited<ReturnType<typeof getSpace>>> =>
        getSpace(spaceId),
    }),

  listCards: () =>
    queryOptions({
      queryKey: spacesQueries.cards(),
      queryFn: async (): Promise<Array<SpaceCard>> => {
        const spacesData = await listSpacesWithCards();

        return spacesData.map((space) => ({
          id: space.id,
          name: space.name,
          description: space.description ?? undefined,
          icon: space.icon,
          color: space.color,
          hasTodo: Boolean(
            space.activePlan && space.activePlan.progressPercent < 100,
          ),
          lastStudiedAt: space.lastStudiedAt ?? undefined,
          activePlan: space.activePlan ?? undefined,
        }));
      },
    }),
};
