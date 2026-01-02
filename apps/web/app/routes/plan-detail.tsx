import { useNavigate, useParams } from "react-router";

import {
  PlanDetailView,
  useActivatePlanMutation,
  usePlanQuery,
  useSetPlanStatusMutation,
  useUpdatePlanSessionMutation,
} from "~/modules/plans";
import { useSpaceQuery } from "~/modules/spaces";

export function meta() {
  return [{ title: "학습 계획 상세" }];
}

export default function PlanDetailRoute() {
  const navigate = useNavigate();
  const { spaceId, planId } = useParams();

  if (!spaceId || !planId) {
    throw new Response("Not Found", { status: 404 });
  }

  const space = useSpaceQuery(spaceId);
  const plan = usePlanQuery(planId);
  const activate = useActivatePlanMutation();
  const setStatus = useSetPlanStatusMutation();
  const updateSession = useUpdatePlanSessionMutation();

  const isSubmitting =
    activate.isPending || setStatus.isPending || updateSession.isPending;

  if (!space.data || !plan.data) return null;

  return (
    <PlanDetailView
      space={space.data}
      plan={plan.data}
      isSubmitting={isSubmitting}
      onActivate={() => {
        activate.mutate({ planId });
      }}
      onSetStatus={(status) => {
        setStatus.mutate(
          { planId, status },
          {
            onSuccess: () => {
              if (status === "ARCHIVED") {
                navigate(`/spaces/${spaceId}/plans`);
              }
            },
          },
        );
      }}
      onUpdateSession={(sessionId, body) => {
        updateSession.mutate({ planId, sessionId, body });
      }}
    />
  );
}
