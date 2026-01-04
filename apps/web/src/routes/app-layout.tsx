import { redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/app-layout";

import { getAuthStatus } from "~/foundation/api/compat/auth";
import { listSpacesForUi } from "~/foundation/api/compat/spaces";
import { AppShell } from "~/domains/app-shell";
import { getRedirectTarget } from "~/foundation/lib/auth";

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
