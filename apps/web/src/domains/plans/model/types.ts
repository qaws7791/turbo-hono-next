export type PlanStatus = "active" | "paused" | "archived";
export type PlanGoal = "career" | "certificate" | "work" | "hobby";
export type PlanLevel = "novice" | "basic" | "intermediate" | "advanced";
export type PlanSessionType = "session" | "review";
export type PlanSessionStatus = "todo" | "in_progress" | "completed";

export type PlanSession = {
  id: string;
  moduleId: string | null;
  title: string;
  type: PlanSessionType;
  scheduledDate: string;
  durationMinutes: number;
  status: PlanSessionStatus;
  completedAt?: string;
};

export type PlanModule = {
  id: string;
  title: string;
  summary?: string;
  sessions: Array<PlanSession>;
};

export type Plan = {
  id: string;
  spaceId: string;
  title: string;
  goal: PlanGoal;
  level: PlanLevel;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  sourceMaterialIds: Array<string>;
  modules: Array<PlanModule>;
};

export type PlanWithDerived = Plan & {
  progressPercent: number;
  totalSessions: number;
};

export type PlanDetailSpace = {
  id: string;
  name: string;
};

export type PlanDetailQueueItem = {
  href: string;
};

export type PlanSourceMaterial = {
  id: string;
  title: string;
  summary?: string;
  kind: "file" | "url" | "text";
};
