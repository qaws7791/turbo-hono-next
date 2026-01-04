import { useLoaderData } from "react-router";

import { getAuthSession } from "~/domains/auth";
import {
  HomeView,
  getHomeQueue,
  getHomeStats,
  getRecentSessions,
} from "~/domains/home";

export function meta() {
  return [{ title: "Home" }];
}

export async function clientLoader() {
  const { user } = await getAuthSession();
  const [stats, queue, recent] = await Promise.all([
    getHomeStats(),
    getHomeQueue(),
    getRecentSessions(6),
  ]);
  return { user, stats, queue, recent };
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
