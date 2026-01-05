import { queryOptions } from "@tanstack/react-query";

import type { Space, SpaceCard } from "./model/spaces.types";

import { listSpaceConcepts } from "~/domains/concepts/api/concepts.api";
import { listSpaceMaterials } from "~/domains/materials/api/materials.api";
import { listSpacePlans } from "~/domains/plans/api";
import { getSpace, listSpaces } from "~/domains/spaces/api/spaces.api";

export const spacesQueries = {
  all: () => ["spaces"] as const,
  lists: () => [...spacesQueries.all(), "list"] as const,
  details: () => [...spacesQueries.all(), "detail"] as const,
  cards: () => [...spacesQueries.all(), "cards"] as const,

  list: () =>
    queryOptions({
      queryKey: spacesQueries.lists(),
      queryFn: (): Promise<Array<Space>> => listSpaces(),
      staleTime: 10_000,
      gcTime: 60_000,
    }),

  detail: (spaceId: string) =>
    queryOptions({
      queryKey: [...spacesQueries.details(), spaceId] as const,
      queryFn: (): Promise<Awaited<ReturnType<typeof getSpace>>> =>
        getSpace(spaceId),
      staleTime: 10_000,
      gcTime: 60_000,
    }),

  listCards: () =>
    queryOptions({
      queryKey: spacesQueries.cards(),
      queryFn: async (): Promise<Array<SpaceCard>> => {
        const spaces = await listSpaces();

        const cards: Array<SpaceCard> = await Promise.all(
          spaces.map(async (space) => {
            const [materials, concepts, plans] = await Promise.all([
              listSpaceMaterials(space.id, { page: 1, limit: 1 }),
              listSpaceConcepts(space.id, { page: 1, limit: 1 }),
              listSpacePlans(space.id, { status: "ACTIVE", limit: 1 }),
            ]);

            const lastStudiedAt = concepts.data[0]?.lastStudiedAt;
            const activePlan = plans.data[0] ?? null;

            return {
              id: space.id,
              name: space.name,
              description: space.description,
              icon: space.icon,
              color: space.color,
              hasTodo: Boolean(activePlan && activePlan.progressPercent < 100),
              materialCount: materials.meta.total,
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
