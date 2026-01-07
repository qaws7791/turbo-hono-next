import type { Route } from "./+types/app-layout";

import { AppShell } from "~/domains/app-shell";
import { requireAuth } from "~/domains/auth";
import { spacesQueries } from "~/domains/spaces";
import { queryClient } from "~/foundation/query-client";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  await requireAuth(request);
  await queryClient.ensureQueryData(spacesQueries.list());
}

export default function AppLayoutRoute() {
  return <AppShell />;
}
