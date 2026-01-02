import type { HomeQueueItem } from "~/mock/api";

export type HomeModel = {
  nextQueueItem: HomeQueueItem | undefined;
  primaryCtaHref: string;
  primaryCtaLabel: string;
  showEmptyQueueActions: boolean;
};
