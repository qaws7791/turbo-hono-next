import { useSuspenseQuery } from "@tanstack/react-query";

import { authQueries } from "~/domains/auth";
import { HomeView, homeQueries } from "~/domains/home";
import { queryClient } from "~/foundation/query-client";

export function meta() {
  return [{ title: "Home" }];
}

export async function clientLoader() {
  await Promise.all([
    queryClient.prefetchQuery(authQueries.getSession()),
    queryClient.prefetchQuery(homeQueries.getStats()),
    queryClient.prefetchQuery(homeQueries.getQueue()),
    queryClient.prefetchQuery(homeQueries.getRecentSessions(6)),
  ]);
  return {};
}

export default function HomeRoute() {
  const { data: session } = useSuspenseQuery(authQueries.getSession());
  const { data: stats } = useSuspenseQuery(homeQueries.getStats());
  const { data: queue } = useSuspenseQuery(homeQueries.getQueue());
  const { data: recent } = useSuspenseQuery(homeQueries.getRecentSessions(6));
  const user = session.user;
  if (!user) {
    throw new Error("Authenticated session is required.");
  }

  return (
    <HomeView
      user={user}
      stats={stats}
      queue={queue}
      recent={recent}
    />
  );
}
