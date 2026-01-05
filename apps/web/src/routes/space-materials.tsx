import { useSuspenseQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router";

import type { Route } from "./+types/space-materials";

import { SpaceMaterialsView, materialsQueries } from "~/domains/materials";
import { PublicIdSchema } from "~/foundation/lib";
import { queryClient } from "~/foundation/query-client";

const SpaceIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "문서" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  await queryClient.prefetchQuery(materialsQueries.listForSpace(spaceId.data));
  return {
    spaceId: spaceId.data,
  };
}

export default function SpaceMaterialsRoute() {
  const { spaceId } = useLoaderData<typeof clientLoader>();
  const { data: materials } = useSuspenseQuery(
    materialsQueries.listForSpace(spaceId),
  );
  return (
    <SpaceMaterialsView
      spaceId={spaceId}
      materials={materials}
    />
  );
}
