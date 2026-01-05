import { useSuspenseQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router";

import type { Route } from "./+types/plan-detail";

import { PlanDetailView, plansQueries } from "~/domains/plans";
import { PublicIdSchema } from "~/foundation/lib";
import { queryClient } from "~/foundation/query-client";

const SpaceIdSchema = PublicIdSchema;
const PlanIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "학습 계획 상세" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  const planId = PlanIdSchema.safeParse(params.planId);
  if (!spaceId.success || !planId.success) {
    throw new Response("Not Found", { status: 404 });
  }

  await queryClient.prefetchQuery(
    plansQueries.detailPage(spaceId.data, planId.data),
  );
  return { spaceId: spaceId.data, planId: planId.data };
}

export default function PlanDetailRoute() {
  const { spaceId, planId } = useLoaderData<typeof clientLoader>();
  const { data } = useSuspenseQuery(plansQueries.detailPage(spaceId, planId));
  return <PlanDetailView data={data} />;
}
