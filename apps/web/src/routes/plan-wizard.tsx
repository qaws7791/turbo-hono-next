import type { Route } from "./+types/plan-wizard";

import { materialsQueries } from "~/domains/materials";
import { PlanWizardView } from "~/domains/plans";
import { PublicIdSchema } from "~/foundation/lib";
import { queryClient } from "~/foundation/query-client";

const SpaceIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "학습 계획 생성" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  await queryClient.ensureQueryData(
    materialsQueries.listForSpace(spaceId.data),
  );
}

export default function PlanWizardRoute({ params }: Route.ComponentProps) {
  return <PlanWizardView spaceId={params.spaceId} />;
}
