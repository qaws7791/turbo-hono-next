import { HomeView, homeQueries } from "~/domains/home";
import { queryClient } from "~/foundation/query-client";

export function meta() {
  return [{ title: "Home" }];
}

export async function clientLoader() {
  await Promise.all([
    queryClient.ensureQueryData(homeQueries.getStats()),
    queryClient.ensureQueryData(homeQueries.getQueue()),
    queryClient.ensureQueryData(homeQueries.getRecentSessions(6)),
  ]);
}

export default function HomeRoute() {
  return <HomeView />;
}
