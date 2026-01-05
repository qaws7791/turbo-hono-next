import { useSuspenseQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router";

import type { Route } from "./+types/space-plans";

import { plansQueries } from "~/domains/plans";
import {
  SpacePlansView,
  spacesQueries,
  useSpacePlansModel,
} from "~/domains/spaces";
import { PublicIdSchema } from "~/foundation/lib";
import { queryClient } from "~/foundation/query-client";

const SpaceIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "학습 계획" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  await Promise.all([
    queryClient.prefetchQuery(spacesQueries.detail(spaceId.data)),
    queryClient.prefetchQuery(plansQueries.listForSpace(spaceId.data)),
  ]);

  return { spaceId: spaceId.data };
}

export default function SpacePlansRoute() {
  const { spaceId } = useLoaderData<typeof clientLoader>();
  const { data: space } = useSuspenseQuery(spacesQueries.detail(spaceId));
  const { data: plans } = useSuspenseQuery(plansQueries.listForSpace(spaceId));
  const model = useSpacePlansModel({ plans });
  return (
    <SpacePlansView
      space={space}
      model={model}
    />
  );
}
