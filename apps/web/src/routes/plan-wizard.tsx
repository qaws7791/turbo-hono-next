import { materialsQueries } from "~/domains/materials";
import { PlanWizardView } from "~/domains/plans";
import { queryClient } from "~/foundation/query-client";

export function meta() {
  return [{ title: "학습 계획 생성" }];
}

export async function clientLoader() {
  await queryClient.ensureQueryData(materialsQueries.list());
}

export default function PlanWizardRoute() {
  return <PlanWizardView />;
}
