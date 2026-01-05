import { useLoaderData } from "react-router";

import type { Route } from "./+types/space-concepts";

import { SpaceConceptsView, listSpaceConceptsForUi } from "~/domains/concepts";
import { getSpaceForUi } from "~/domains/spaces";
import { PublicIdSchema } from "~/foundation/lib";

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
  const concepts = await listSpaceConceptsForUi(spaceId.data, {
    page: 1,
    limit: 50,
  });

  return {
    space,
    concepts: concepts.data,
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
