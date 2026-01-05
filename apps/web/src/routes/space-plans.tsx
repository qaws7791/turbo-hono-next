import { useLoaderData } from "react-router";

import type { Route } from "./+types/space-plans";

import { listPlansForUi } from "~/domains/plans";
import {
  SpacePlansView,
  getSpaceForUi,
  useSpacePlansModel,
} from "~/domains/spaces";
import { PublicIdSchema } from "~/foundation/lib";

const SpaceIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "학습 계획" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  const space = await getSpaceForUi(spaceId.data);
  const plans = await listPlansForUi(spaceId.data);

  return { space, plans };
}

export default function SpacePlansRoute() {
  const { space, plans } = useLoaderData<typeof clientLoader>();
  const model = useSpacePlansModel({ plans });
  return (
    <SpacePlansView
      space={space}
      model={model}
    />
  );
}
