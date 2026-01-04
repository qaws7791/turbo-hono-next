export type HomeQueueItem = {
  href: string;
  kind: "SESSION" | "CONCEPT_REVIEW";
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
