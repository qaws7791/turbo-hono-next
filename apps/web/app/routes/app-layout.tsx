import { redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/app-layout";

import { AppShell } from "~/features/app-shell/app-shell";
import { getRedirectTarget } from "~/lib/auth";
import { getAuthStatus } from "~/api/compat/auth";
import { listSpacesForUi } from "~/api/compat/spaces";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { isAuthenticated, user } = await getAuthStatus();
  if (!isAuthenticated || !user) {
    const redirectTo = getRedirectTarget(request.url);
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  return { user, spaces: await listSpacesForUi() };
}

export default function AppLayoutRoute() {
  const { user, spaces } = useLoaderData<typeof clientLoader>();
  return (
    <AppShell
      user={user}
      spaces={spaces}
    />
  );
}
