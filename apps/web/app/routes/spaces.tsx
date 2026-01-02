import { redirect, useLoaderData, useSearchParams } from "react-router";

import type { SpaceCard } from "~/features/spaces/types";
import type { Route } from "./+types/spaces";

import { createSpaceForUi } from "~/api/compat/spaces";
import { SpacesView } from "~/features/spaces/spaces-view";
import { useSpacesModel } from "~/features/spaces/use-spaces-model";
import {
  getPlanBySpaceActive,
  listConcepts,
  listDocuments,
  listSpaces,
  planNextQueue,
} from "~/mock/api";

export function meta() {
  return [{ title: "스페이스" }];
}

export function clientLoader() {
  const spaces = listSpaces();
  const cards: Array<SpaceCard> = spaces.map((space) => {
    const activePlan = getPlanBySpaceActive(space.id);
    const queueCount = activePlan ? planNextQueue(activePlan.id, 3).length : 0;
    const documents = listDocuments(space.id);
    const concepts = listConcepts({ spaceId: space.id });
    const lastStudiedConcept = concepts[0]; // sorted by lastStudiedAt desc

    return {
      id: space.id,
      name: space.name,
      description: space.description,
      icon: space.icon,
      color: space.color,
      hasTodo: queueCount > 0,
      documentCount: documents.length,
      conceptCount: concepts.length,
      lastStudiedAt: lastStudiedConcept?.lastStudiedAt,
      activePlan: activePlan
        ? {
            id: activePlan.id,
            title: activePlan.title,
            progressPercent: activePlan.progressPercent,
          }
        : undefined,
    };
  });
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
