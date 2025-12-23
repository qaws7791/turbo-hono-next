import { useLoaderData } from "react-router";

import { HomeView } from "~/features/home/home-view";
import {
  authStatus,
  homeQueue,
  recentSessions,
  statsForHome,
} from "~/mock/api";

export function meta() {
  return [{ title: "Home" }];
}

export function clientLoader() {
  const { user } = authStatus();
  return {
    user,
    stats: statsForHome(),
    queue: homeQueue(),
    recent: recentSessions(6),
  };
}

export default function HomeRoute() {
  const { user, stats, queue, recent } = useLoaderData<typeof clientLoader>();

  return (
    <HomeView
      user={user}
      stats={stats}
      queue={queue}
      recent={recent}
    />
  );
}
