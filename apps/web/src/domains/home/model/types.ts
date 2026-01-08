export type HomeQueue = {
  items: Array<HomeQueueItem>;
  summary: {
    total: number;
    completed: number;
  };
};

export type HomeQueueSessionItem = {
  href: string;
  kind: "SESSION";
  sessionId: string;
  spaceId: string;
  spaceName: string;
  planId: string;
  planTitle: string;
  moduleTitle: string;
  sessionTitle: string;
  type: "session" | "review";
  status: "todo" | "in_progress" | "completed";
  scheduledDate: string;
  durationMinutes: number;
  spaceIcon: string;
  spaceColor: string;
};

export type HomeQueueConceptReviewItem = {
  href: string;
  kind: "CONCEPT_REVIEW";
  conceptId: string;
  conceptTitle: string;
  oneLiner: string;
  spaceId: string;
  spaceName: string;
  type: "review";
  scheduledDate: string;
  durationMinutes: number;
  spaceIcon: string;
  spaceColor: string;
};

export type HomeQueueItem = HomeQueueSessionItem | HomeQueueConceptReviewItem;

export type HomeStats = {
  coachingMessage: string;
  remainingCount: number;
  completedCountToday: number;
  estimatedMinutes: number;
  streakDays: number;
};

export type SessionSummaryCard = {
  sessionId: string;
  planId: string;
  spaceId: string;
  moduleTitle: string;
  sessionTitle: string;
  completedAt: string;
  durationMinutes: number;
  conceptCount: number;
};
