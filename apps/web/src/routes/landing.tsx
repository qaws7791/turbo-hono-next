import { useSuspenseQuery } from "@tanstack/react-query";

import { authQueries } from "~/domains/auth";
import { LandingView } from "~/domains/landing";
import { queryClient } from "~/foundation/query-client";

export function meta() {
  return [
    { title: "Learning OS" },
    {
      name: "description",
      content: "자료만 업로드하세요. 나머지는 AI가 합니다.",
    },
  ];
}

export async function clientLoader() {
  await queryClient.prefetchQuery(authQueries.getSession());
  return {};
}

export default function LandingRoute() {
  const { data: session } = useSuspenseQuery(authQueries.getSession());
  return <LandingView isAuthenticated={session.isAuthenticated} />;
}
