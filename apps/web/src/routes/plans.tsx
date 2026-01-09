import { PlansListView, plansQueries } from "~/domains/plans";
import { queryClient } from "~/foundation/query-client";

export function meta() {
  return [{ title: "학습 계획" }];
}

export async function clientLoader() {
  await queryClient.ensureQueryData(plansQueries.list());
}

export default function PlansRoute() {
  return <PlansListView />;
}
