import { MaterialsListView, materialsQueries } from "~/domains/materials";
import { queryClient } from "~/foundation/query-client";

export function meta() {
  return [{ title: "학습 자료" }];
}

export async function clientLoader() {
  await queryClient.ensureQueryData(materialsQueries.list());
}

export default function MaterialsRoute() {
  return <MaterialsListView />;
}
