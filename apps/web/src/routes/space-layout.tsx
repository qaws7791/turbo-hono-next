import { useSuspenseQuery } from "@tanstack/react-query";
import { redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/space-layout";

import { SpaceLayoutView, spacesQueries } from "~/domains/spaces";
import { PublicIdSchema } from "~/foundation/lib";
import { queryClient } from "~/foundation/query-client";

const SpaceIdSchema = PublicIdSchema;

function tabToPath(spaceId: string, tab: string): string | null {
  if (tab === "materials") return `/spaces/${spaceId}/materials`;
  if (tab === "plans") return `/spaces/${spaceId}`;
  if (tab === "concepts") return `/spaces/${spaceId}/concepts`;
  return null;
}

export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }

  const url = new URL(request.url);
  const tab = url.searchParams.get("tab");
  if (tab) {
    const to = tabToPath(spaceId.data, tab);
    if (to) {
      throw redirect(to);
    }
  }

  await queryClient.prefetchQuery(spacesQueries.detail(spaceId.data));
  return { spaceId: spaceId.data };
}

export default function SpaceLayoutRoute() {
  const { spaceId } = useLoaderData<typeof clientLoader>();
  const { data: space } = useSuspenseQuery(spacesQueries.detail(spaceId));
  return <SpaceLayoutView space={space} />;
}
