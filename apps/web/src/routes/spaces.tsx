import { useSuspenseQuery } from "@tanstack/react-query";

import { SpacesView, spacesQueries } from "~/domains/spaces";
import { queryClient } from "~/foundation/query-client";

export function meta() {
  return [{ title: "스페이스" }];
}

export async function clientLoader() {
  await queryClient.prefetchQuery(spacesQueries.listCards());
  return {};
}

export default function SpacesRoute() {
  const { data: spaces } = useSuspenseQuery(spacesQueries.listCards());
  return <SpacesView spaces={spaces} />;
}
