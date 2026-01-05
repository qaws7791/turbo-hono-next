import { redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/space-layout";

import {
  SpaceLayoutView,
  getSpaceForUi,
  updateSpaceForUi,
  useSpaceLayoutModel,
} from "~/domains/spaces";
import { PublicIdSchema } from "~/foundation/lib";

const SpaceIdSchema = PublicIdSchema;

function tabToPath(spaceId: string, tab: string): string | null {
  if (tab === "materials") return `/spaces/${spaceId}/materials`;
  if (tab === "plans") return `/spaces/${spaceId}`;
  if (tab === "concepts") return `/spaces/${spaceId}/concepts`;
  return null;
}

export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }

  const url = new URL(request.url);
  const tab = url.searchParams.get("tab");
  if (tab) {
    const to = tabToPath(spaceId.data, tab);
    if (to) {
      throw redirect(to);
    }
  }

  return {
    space: await getSpaceForUi(spaceId.data),
  };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "update-space") {
    const spaceId = SpaceIdSchema.parse(formData.get("spaceId"));
    const icon = formData.get("icon");
    const color = formData.get("color");

    await updateSpaceForUi(spaceId, {
      icon: typeof icon === "string" ? icon : undefined,
      color: typeof color === "string" ? color : undefined,
    });

    return { ok: true };
  }

  throw new Response("Bad Request", { status: 400 });
}

export default function SpaceLayoutRoute() {
  const { space } = useLoaderData<typeof clientLoader>();
  const model = useSpaceLayoutModel(space);
  return (
    <SpaceLayoutView
      space={space}
      model={model}
    />
  );
}
