import { useSuspenseQuery } from "@tanstack/react-query";

import { TodayView, homeQueries } from "~/domains/home";
import { queryClient } from "~/foundation/query-client";

export function meta() {
  return [{ title: "오늘 할 일" }];
}

export async function clientLoader() {
  await queryClient.prefetchQuery(homeQueries.getQueue());
  return {};
}

export default function TodayRoute() {
  const { data: queue } = useSuspenseQuery(homeQueries.getQueue());
  return <TodayView queue={queue} />;
}
