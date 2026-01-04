import type { HomeQueueItem } from "~/foundation/api/compat/home";

export type HomeModel = {
  nextQueueItem: HomeQueueItem | undefined;
  primaryCtaHref: string;
  primaryCtaLabel: string;
  showEmptyQueueActions: boolean;
};
