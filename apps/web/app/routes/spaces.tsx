import { redirect, useLoaderData, useSearchParams } from "react-router";

import type { SpaceCard } from "~/features/spaces/types";
import type { Route } from "./+types/spaces";

import { createSpaceForUi, listSpacesForUi } from "~/api/compat/spaces";
import { getActivePlanForSpaceUi } from "~/api/compat/plans";
import { listMaterials } from "~/api/materials";
import { listSpaceConcepts } from "~/api/concepts";
import { SpacesView } from "~/features/spaces/spaces-view";
import { useSpacesModel } from "~/features/spaces/use-spaces-model";

export function meta() {
  return [{ title: "스페이스" }];
}

export async function clientLoader() {
  const spaces = await listSpacesForUi();

  const cards: Array<SpaceCard> = await Promise.all(
    spaces.map(async (space) => {
      const [materials, concepts, activePlan] = await Promise.all([
        listMaterials(space.id, { page: 1, limit: 1 }),
        listSpaceConcepts(space.id, { page: 1, limit: 1 }),
        getActivePlanForSpaceUi(space.id),
      ]);

      const lastStudiedAt = concepts.data[0]?.lastLearnedAt ?? undefined;

      return {
        id: space.id,
        name: space.name,
        description: space.description,
        icon: space.icon,
        color: space.color,
        hasTodo: Boolean(activePlan && activePlan.progressPercent < 100),
        documentCount: materials.meta.total,
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

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");

  if (intent === "create-space") {
    const name = String(formData.get("name") ?? "");
    const descriptionRaw = String(formData.get("description") ?? "");
    const description =
      descriptionRaw.trim().length > 0 ? descriptionRaw : undefined;
    const space = await createSpaceForUi({ name, description });
    throw redirect(`/spaces/${space.id}`);
  }

  return null;
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
