import { useQuery } from "@tanstack/react-query";


import { fetchHomeQueue } from "./api";

import type { HomeQueueResponse } from "./types";
import type { ApiError } from "~/modules/api";

const homeKeys = {
  all: ["home"] as const,
  queue: () => [...homeKeys.all, "queue"] as const,
};

export function useHomeQueueQuery() {
  return useQuery<HomeQueueResponse, ApiError>({
    queryKey: homeKeys.queue(),
    queryFn: fetchHomeQueue,
  });
}

