import { SpacesView, spacesQueries } from "~/domains/spaces";
import { queryClient } from "~/foundation/query-client";

export function meta() {
  return [{ title: "스페이스" }];
}

export async function clientLoader() {
  await queryClient.ensureQueryData(spacesQueries.listCards());
}

export default function SpacesRoute() {
  return <SpacesView />;
}
