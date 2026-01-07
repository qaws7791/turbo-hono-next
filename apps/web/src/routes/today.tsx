import { TodayView, homeQueries } from "~/domains/home";
import { queryClient } from "~/foundation/query-client";

export function meta() {
  return [{ title: "오늘 할 일" }];
}

export async function clientLoader() {
  await queryClient.ensureQueryData(homeQueries.getQueue());
}

export default function TodayRoute() {
  return <TodayView />;
}
