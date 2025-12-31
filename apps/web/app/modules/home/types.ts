export type HomeSessionType = "LEARN" | "REVIEW";

export type HomeQueueItemStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SKIPPED"
  | "CANCELED";

export type HomeQueueItem = {
  sessionId: string;
  spaceName: string;
  planTitle: string;
  moduleTitle: string;
  sessionTitle: string;
  sessionType: HomeSessionType;
  estimatedMinutes: number;
  status: HomeQueueItemStatus;
};

export type HomeQueueSummary = {
  total: number;
  completed: number;
};

export type HomeQueueResponse = {
  data: Array<HomeQueueItem>;
  summary: HomeQueueSummary;
};
