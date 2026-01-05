import { useSuspenseQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router";

import type { Route } from "./+types/space-concepts";

import { SpaceConceptsView, conceptsQueries } from "~/domains/concepts";
import { spacesQueries } from "~/domains/spaces";
import { PublicIdSchema } from "~/foundation/lib";
import { queryClient } from "~/foundation/query-client";

const SpaceIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "개념" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  await Promise.all([
    queryClient.prefetchQuery(spacesQueries.detail(spaceId.data)),
    queryClient.prefetchQuery(
      conceptsQueries.listForSpace(spaceId.data, { page: 1, limit: 50 }),
    ),
  ]);

  return {
    spaceId: spaceId.data,
  };
}

export default function SpaceConceptsRoute() {
  const { spaceId } = useLoaderData<typeof clientLoader>();
  const { data: space } = useSuspenseQuery(spacesQueries.detail(spaceId));
  const { data: concepts } = useSuspenseQuery(
    conceptsQueries.listForSpace(spaceId, { page: 1, limit: 50 }),
  );
  return (
    <SpaceConceptsView
      space={space}
      concepts={concepts.data}
    />
  );
}
