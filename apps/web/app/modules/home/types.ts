import type { paths } from "~/types/api";

export type HomeQueueResponse =
  paths["/api/home/queue"]["get"]["responses"][200]["content"]["application/json"];

export type HomeQueueItem = HomeQueueResponse["data"][number];
export type HomeQueueSummary = HomeQueueResponse["summary"];

