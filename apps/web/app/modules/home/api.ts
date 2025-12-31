import type { HomeQueueResponse } from "./types";

import { apiClient, unwrap } from "~/modules/api";


export async function fetchHomeQueue(): Promise<HomeQueueResponse> {
  const result = await apiClient.GET("/api/home/queue");
  return unwrap(result);
}

