import { useLoaderData } from "react-router";

import type { Route } from "./+types/space-concepts";

import { PublicIdSchema } from "~/app/mocks/schemas";
import { SpaceConceptsView, toConceptFromListItem } from "~/domains/concepts";
import { getSpaceForUi } from "~/domains/spaces";
import { listSpaceConcepts } from "~/foundation/api/concepts";

const SpaceIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "개념" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  const space = await getSpaceForUi(spaceId.data);
  const concepts = await listSpaceConcepts(spaceId.data, {
    page: 1,
    limit: 50,
  });

  return {
    space,
    concepts: concepts.data.map((c) => toConceptFromListItem(spaceId.data, c)),
  };
}

export default function SpaceConceptsRoute() {
  const { space, concepts } = useLoaderData<typeof clientLoader>();
  return (
    <SpaceConceptsView
      space={space}
      concepts={concepts}
    />
  );
}
