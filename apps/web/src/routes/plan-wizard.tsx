import { useSuspenseQuery } from "@tanstack/react-query";
import { useLoaderData, useNavigate } from "react-router";

import type { Route } from "./+types/plan-wizard";

import { materialsQueries } from "~/domains/materials";
import {
  PlanWizardView,
  useCreatePlanMutation,
  usePlanWizardForm,
} from "~/domains/plans";
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
  await queryClient.prefetchQuery(materialsQueries.listForSpace(spaceId.data));
  return { spaceId: spaceId.data };
}

export default function PlanWizardRoute() {
  const { spaceId } = useLoaderData<typeof clientLoader>();
  const { data: materials } = useSuspenseQuery(
    materialsQueries.listForSpace(spaceId),
  );
  const navigate = useNavigate();
  const { isSubmitting, createPlan } = useCreatePlanMutation(spaceId);

  const wizardForm = usePlanWizardForm({
    materials,
    submitPlan: createPlan,
  });

  return (
    <PlanWizardView
      spaceId={spaceId}
      materials={materials}
      model={wizardForm}
      isSubmitting={isSubmitting}
      onCancel={() => navigate(`/spaces/${spaceId}/plans`)}
    />
  );
}
