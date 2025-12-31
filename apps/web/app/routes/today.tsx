import { useHomeQueueQuery } from "~/modules/home";
import { TodayView } from "~/modules/today";

export function meta() {
  return [{ title: "오늘 할 일" }];
}

export default function TodayRoute() {
  const queue = useHomeQueueQuery();
  if (!queue.data) return null;
  return <TodayView queue={queue.data.data} />;
}
