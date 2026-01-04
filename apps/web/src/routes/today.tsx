import { useLoaderData } from "react-router";

import { getHomeQueue } from "~/domains/home";
import { TodayView } from "~/domains/today";

export function meta() {
  return [{ title: "오늘 할 일" }];
}

export async function clientLoader() {
  return {
    queue: await getHomeQueue(),
  };
}

export default function TodayRoute() {
  const { queue } = useLoaderData<typeof clientLoader>();
  return <TodayView queue={queue} />;
}
