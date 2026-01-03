import { useLoaderData } from "react-router";

import { homeQueue } from "~/api/compat/home";
import { TodayView } from "~/features/today/today-view";

export function meta() {
  return [{ title: "오늘 할 일" }];
}

export async function clientLoader() {
  return {
    queue: await homeQueue(),
  };
}

export default function TodayRoute() {
  const { queue } = useLoaderData<typeof clientLoader>();
  return <TodayView queue={queue} />;
}
