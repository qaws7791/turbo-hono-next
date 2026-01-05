import { useLoaderData, useSearchParams } from "react-router";

import type { SpaceCard } from "~/domains/spaces";

import { listSpaceConceptsForUi } from "~/domains/concepts";
import { getMaterialCountForSpaceUi } from "~/domains/materials";
import { getActivePlanForSpaceUi } from "~/domains/plans";
import { SpacesView, listSpacesForUi, useSpacesModel } from "~/domains/spaces";

export function meta() {
  return [{ title: "스페이스" }];
}

export async function clientLoader() {
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

  return { spaces: cards };
}

export default function SpacesRoute() {
  const { spaces } = useLoaderData<typeof clientLoader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const model = useSpacesModel({
    spaces,
    searchParams,
    setSearchParams: (next) => setSearchParams(next, { replace: true }),
  });

  return <SpacesView model={model} />;
}
