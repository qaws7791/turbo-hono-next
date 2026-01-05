import { useLoaderData, useNavigate } from "react-router";

import type { Route } from "./+types/plan-wizard";

import { listMaterialsForUi } from "~/domains/materials";
import {
  PlanWizardView,
  useCreatePlanMutation,
  usePlanWizardModel,
} from "~/domains/plans";
import { PublicIdSchema } from "~/foundation/lib";

const SpaceIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "학습 계획 생성" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  const materials = await listMaterialsForUi(spaceId.data);
  return { spaceId: spaceId.data, materials };
}

export default function PlanWizardRoute() {
  const { spaceId, materials } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();
  const { isSubmitting, createPlan } = useCreatePlanMutation(spaceId);

  const model = usePlanWizardModel({
    materials,
    submitPlan: createPlan,
  });

  return (
    <PlanWizardView
      spaceId={spaceId}
      materials={materials}
      model={model}
      isSubmitting={isSubmitting}
      onCancel={() => navigate(`/spaces/${spaceId}/plans`)}
    />
  );
}
