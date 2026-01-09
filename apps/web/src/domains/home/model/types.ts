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
  planId: string;
  planTitle: string;
  planIcon: string;
  planColor: string;
  moduleTitle: string;
  sessionTitle: string;
  type: "session";
  status: "todo" | "in_progress" | "completed";
  scheduledDate: string;
  durationMinutes: number;
};

export type HomeQueueItem = HomeQueueSessionItem;

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
  moduleTitle: string;
  sessionTitle: string;
  completedAt: string;
  durationMinutes: number;
};
