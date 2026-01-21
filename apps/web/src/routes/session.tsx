import { useLoaderData } from "react-router";

import type { Route } from "./+types/session";

import { requireAuth } from "~/domains/auth";
import {
  SessionRouteView,
  parseSessionParams,
  sessionQueries,
} from "~/domains/session";
import { queryClient } from "~/foundation/query-client";

export function meta() {
  return [{ title: "학습 세션" }];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  await requireAuth(request);

  const params = parseSessionParams(request);

  if (params.mode === "run") {
    await queryClient.ensureQueryData(sessionQueries.run(params.runId));
  }

  return params;
}

export default function SessionRoute() {
  const data = useLoaderData<typeof clientLoader>();
  return <SessionRouteView loaderData={data} />;
}
