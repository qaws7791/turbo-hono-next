import { useParams } from "react-router";

import {
  SpacePlansView,
  useSpacePlansModel,
  useSpacePlansQuery,
} from "~/modules/plans";
import { useSpaceQuery } from "~/modules/spaces";

export function meta() {
  return [{ title: "학습 계획" }];
}

function SpacePlansRouteWithId({ spaceId }: { spaceId: string }) {
  const space = useSpaceQuery(spaceId);
  const plans = useSpacePlansQuery({ spaceId });
  const model = useSpacePlansModel({ plans: plans.data?.data ?? [] });

  if (!space.data || !plans.data) return null;

  return (
    <SpacePlansView
      space={space.data}
      model={model}
    />
  );
}

export default function SpacePlansRoute() {
  const { spaceId } = useParams();
  if (!spaceId) {
    throw new Response("Not Found", { status: 404 });
  }

  return <SpacePlansRouteWithId spaceId={spaceId} />;
}
