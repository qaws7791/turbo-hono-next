import { useLoaderData } from "react-router";

import type { Route } from "./+types/space-materials";

import {
  SpaceMaterialsView,
  listMaterialsForUi,
  useSpaceMaterialsModel,
} from "~/domains/materials";
import { PublicIdSchema } from "~/foundation/lib";

const SpaceIdSchema = PublicIdSchema;

export function meta() {
  return [{ title: "문서" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }
  return {
    spaceId: spaceId.data,
    materials: await listMaterialsForUi(spaceId.data),
  };
}

export default function SpaceMaterialsRoute() {
  const { spaceId, materials } = useLoaderData<typeof clientLoader>();
  const model = useSpaceMaterialsModel(materials);
  return (
    <SpaceMaterialsView
      spaceId={spaceId}
      materials={materials}
      model={model}
    />
  );
}
