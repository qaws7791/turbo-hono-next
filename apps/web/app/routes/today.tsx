import { useLoaderData } from "react-router";

import { TodayView } from "~/features/today/today-view";
import { homeQueue } from "~/mock/api";

export function meta() {
  return [{ title: "오늘 할 일" }];
}

export function clientLoader() {
  return {
    queue: homeQueue(),
  };
}

export default function TodayRoute() {
  const { queue } = useLoaderData<typeof clientLoader>();

  return <TodayView queue={queue} />;
}
