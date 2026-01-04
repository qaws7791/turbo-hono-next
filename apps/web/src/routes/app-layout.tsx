import { redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/app-layout";

import { AppShell } from "~/domains/app-shell";
import { getAuthSession } from "~/domains/auth";
import { listSpacesForUi } from "~/domains/spaces";
import { getRedirectTarget } from "~/foundation/lib/auth";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const { isAuthenticated, user } = await getAuthSession();
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
