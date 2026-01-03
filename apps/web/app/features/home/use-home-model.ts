import type { HomeQueueItem } from "~/api/compat/home";

export type HomeModel = {
  nextQueueItem: HomeQueueItem | undefined;
  primaryCtaHref: string;
  primaryCtaLabel: string;
  showEmptyQueueActions: boolean;
};
