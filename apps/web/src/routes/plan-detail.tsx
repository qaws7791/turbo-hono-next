import type { Route } from "./+types/plan-detail";

import { PlanDetailView, plansQueries } from "~/domains/plans";
import { spacesQueries } from "~/domains/spaces";
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

  await Promise.all([
    queryClient.ensureQueryData(spacesQueries.detail(spaceId.data)),
    queryClient.ensureQueryData(plansQueries.detail(planId.data)),
  ]);
}

export default function PlanDetailRoute({ params }: Route.ComponentProps) {
  return (
    <PlanDetailView
      spaceId={params.spaceId}
      planId={params.planId}
    />
  );
}
