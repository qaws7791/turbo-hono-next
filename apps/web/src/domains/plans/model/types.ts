export type PlanStatus = "active" | "paused" | "archived";
export type PlanSessionType = "session";
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
  title: string;
  icon: string;
  color: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  sourceMaterialIds: Array<string>;
  materials: Array<PlanSourceMaterial>;
  modules: Array<PlanModule>;
};

export type PlanWithDerived = Plan & {
  progressPercent: number;
  totalSessions: number;
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
