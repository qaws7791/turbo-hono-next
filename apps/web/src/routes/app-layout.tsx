import type { Route } from "./+types/app-layout";

import { AppShell } from "~/domains/app-shell";
import { requireAuth } from "~/domains/auth";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  await requireAuth(request);
}

export default function AppLayoutRoute() {
  return <AppShell />;
}
