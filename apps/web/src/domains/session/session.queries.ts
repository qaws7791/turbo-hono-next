import { queryOptions } from "@tanstack/react-query";

import { getSessionRunForUi } from "./api/session-api";

import type { SessionRunInput } from "./model/types";

export const sessionQueries = {
  all: () => ["session"] as const,
  runs: () => [...sessionQueries.all(), "run"] as const,

  run: (runId: string) =>
    queryOptions({
      queryKey: [...sessionQueries.runs(), runId] as const,
      queryFn: (): Promise<SessionRunInput> => getSessionRunForUi(runId),
      staleTime: 5_000,
      gcTime: 60_000,
    }),
};
