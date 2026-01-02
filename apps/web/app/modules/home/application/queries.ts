import { useQuery } from "@tanstack/react-query";

import { fetchHomeQueue } from "../api";

import { homeKeys } from "./keys";

import type { ApiError } from "~/modules/api";
import type { HomeQueueResponse } from "../domain";

export function useHomeQueueQuery() {
  return useQuery<HomeQueueResponse, ApiError>({
    queryKey: homeKeys.queue(),
    queryFn: fetchHomeQueue,
  });
}
