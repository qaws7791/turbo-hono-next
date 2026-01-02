import { redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/app-layout";

import { AppShell } from "~/features/app-shell/app-shell";
import { getRedirectTarget } from "~/lib/auth";
import { authStatus, listSpaces } from "~/mock/api";

export function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { isAuthenticated, user } = authStatus();
  if (!isAuthenticated || !user) {
    const redirectTo = getRedirectTarget(request.url);
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  return { user, spaces: listSpaces() };
}

export default function AppLayoutRoute() {
  const { user, spaces } = useLoaderData<typeof clientLoader>();
  return <AppShell user={user} spaces={spaces} />;
}

