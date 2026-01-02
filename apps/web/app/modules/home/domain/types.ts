import type { HomeQueueApiResponse } from "../api/schema";

export type HomeQueueItem = HomeQueueApiResponse["data"][number];

export type HomeSessionType = HomeQueueItem["sessionType"];

export type HomeQueueItemStatus = Extract<
  HomeQueueItem,
  { kind: "SESSION" }
>["status"];

export type HomeQueueSummary = HomeQueueApiResponse["summary"];

export type HomeQueueResponse = HomeQueueApiResponse;
