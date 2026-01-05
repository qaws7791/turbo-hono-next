import { useSuspenseQuery } from "@tanstack/react-query";
import { redirect } from "react-router";

import type { Route } from "./+types/app-layout";

import { AppShell } from "~/domains/app-shell";
import { authQueries } from "~/domains/auth";
import { spacesQueries } from "~/domains/spaces";
import { getRedirectTarget } from "~/foundation/lib/auth";
import { queryClient } from "~/foundation/query-client";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const sessionQuery = authQueries.getSession();
  await queryClient.prefetchQuery(sessionQuery);
  const session = queryClient.getQueryData(sessionQuery.queryKey);
  if (!session?.isAuthenticated || !session.user) {
    const redirectTo = getRedirectTarget(request.url);
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  await queryClient.prefetchQuery(spacesQueries.list());
  return {};
}

export default function AppLayoutRoute() {
  const { data: session } = useSuspenseQuery(authQueries.getSession());
  const { data: spaces } = useSuspenseQuery(spacesQueries.list());
  const user = session.user;
  if (!user) {
    throw new Error("Authenticated session is required.");
  }
  return (
    <AppShell
      user={user}
      spaces={spaces}
    />
  );
}
