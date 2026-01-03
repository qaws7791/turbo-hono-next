import { useLoaderData } from "react-router";

import { HomeView } from "~/features/home/home-view";
import { getAuthStatus } from "~/api/compat/auth";
import { homeQueue, recentSessions, statsForHome } from "~/api/compat/home";

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
