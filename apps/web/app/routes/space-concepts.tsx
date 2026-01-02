import { useLoaderData } from "react-router";

import type { Route } from "./+types/space-concepts";

import { SpaceConceptsView } from "~/features/concepts/space/space-concepts-view";
import { getSpace, listConcepts } from "~/mock/api";
import { PublicIdSchema } from "~/mock/schemas";

const SpaceIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "개념" }];
}

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  const space = getSpace(spaceId.data);

  return {
    space,
    concepts: listConcepts({ spaceId: spaceId.data }),
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
