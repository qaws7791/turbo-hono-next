import type { HomeQueueItem } from "~/domains/home";
import type { Document } from "../../documents/model/types";
import type { Space } from "../../spaces/model/types";

export type PlanStatus = "active" | "paused" | "archived";
export type PlanGoal = "career" | "certificate" | "work" | "hobby";
export type PlanLevel = "novice" | "basic" | "intermediate" | "advanced";
export type PlanSessionType = "session" | "review";
export type PlanSessionStatus = "todo" | "in_progress" | "completed";

export type PlanSession = {
  id: string;
  moduleId: string;
  blueprintId: string;
  title: string;
  type: PlanSessionType;
  scheduledDate: string;
  durationMinutes: number;
  status: PlanSessionStatus;
  completedAt?: string;
  conceptIds: Array<string>;
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
  sourceDocumentIds: Array<string>;
  modules: Array<PlanModule>;
};

export type PlanWithDerived = Plan & {
  progressPercent: number;
  totalSessions: number;
};

// HomeQueueItem은 나중에 home 도메인에서 정의하겠지만,
// 현재 plans에서 순환 참조 없이 사용하기 위해 임시로 정의하거나
// types를 별도 도메인에서 가져와야 합니다.
// 일단은 호환성을 위해 유지합니다.

export type PlanDetailData = {
  space: Space;
  plan: PlanWithDerived;
  nextQueue: Array<HomeQueueItem>;
  sourceDocuments: Array<Document>;
};
