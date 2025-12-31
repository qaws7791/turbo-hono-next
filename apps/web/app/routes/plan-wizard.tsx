import { useNavigate, useParams } from "react-router";

import { useSpaceMaterialsQuery } from "~/modules/materials";
import {
  PlanWizardView,
  useCreatePlanMutation,
  usePlanWizardModel,
} from "~/modules/plans";

export function meta() {
  return [{ title: "학습 계획 생성" }];
}

export default function PlanWizardRoute() {
  const { spaceId } = useParams();
  if (!spaceId) {
    throw new Response("Not Found", { status: 404 });
  }

  const navigate = useNavigate();
  const materials = useSpaceMaterialsQuery({ spaceId, page: 1, limit: 100 });
  const createPlan = useCreatePlanMutation();

  const model = usePlanWizardModel({
    materials: materials.data?.data ?? [],
    submitPlan: (body) => {
      createPlan.mutate(
        { spaceId, body },
        {
          onSuccess: (plan) => {
            navigate(`/spaces/${spaceId}/plan/${plan.id}`);
          },
        },
      );
    },
  });

  return (
    <PlanWizardView
      spaceId={spaceId}
      materials={materials.data?.data ?? []}
      model={model}
      isSubmitting={createPlan.isPending}
      onCancel={() => navigate(`/spaces/${spaceId}/plans`)}
    />
  );
}
