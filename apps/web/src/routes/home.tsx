import { useLoaderData } from "react-router";

import { getAuthStatus } from "~/foundation/api/compat/auth";
import {
  homeQueue,
  recentSessions,
  statsForHome,
} from "~/foundation/api/compat/home";
import { HomeView } from "~/domains/home";

export function meta() {
  return [{ title: "Home" }];
}

export async function clientLoader() {
  const { user } = await getAuthStatus();
  const [stats, queue, recent] = await Promise.all([
    statsForHome(),
    homeQueue(),
    recentSessions(6),
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
