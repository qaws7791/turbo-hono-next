import type { Route } from "./+types/space-layout";

import { SpaceLayoutView, spacesQueries } from "~/domains/spaces";
import { PublicIdSchema } from "~/foundation/lib";
import { queryClient } from "~/foundation/query-client";

const SpaceIdSchema = PublicIdSchema;

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const spaceId = SpaceIdSchema.safeParse(params.spaceId);
  if (!spaceId.success) {
    throw new Response("Not Found", { status: 404 });
  }

  // 모든 탭에 필요한 데이터를 병렬로 프리페치
  await queryClient.ensureQueryData(spacesQueries.detail(spaceId.data));
}

export default function SpaceLayoutRoute({ params }: Route.ComponentProps) {
  return <SpaceLayoutView spaceId={params.spaceId} />;
}
