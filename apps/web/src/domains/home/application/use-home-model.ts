import type { HomeQueueItem } from "../model/types";

export type HomeModel = {
  nextQueueItem: HomeQueueItem | undefined;
  primaryCtaHref: string;
  primaryCtaLabel: string;
  showEmptyQueueActions: boolean;
};
