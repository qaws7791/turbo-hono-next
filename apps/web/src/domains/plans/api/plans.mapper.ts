import type {
  PlanGoal,
  PlanLevel,
  PlanSessionStatus,
  PlanSessionType,
  PlanStatus,
  PlanWithDerived,
} from "../model/types";
import type {
  ApiPlanDetail,
  ApiPlanListItem,
  PlanCreateBody,
} from "./plans.dto";

export function mapGoalType(goalType: ApiPlanListItem["goalType"]): PlanGoal {
  if (goalType === "JOB") return "career";
  if (goalType === "CERT") return "certificate";
  if (goalType === "WORK") return "work";
  return "hobby";
}

export function mapGoalTypeToApi(goal: PlanGoal): PlanCreateBody["goalType"] {
  if (goal === "career") return "JOB";
  if (goal === "certificate") return "CERT";
  if (goal === "work") return "WORK";
  return "HOBBY";
}

export function mapCurrentLevel(
  level: ApiPlanDetail["currentLevel"],
): PlanLevel {
  if (level === "ADVANCED") return "advanced";
  if (level === "INTERMEDIATE") return "intermediate";
  return "novice";
}

export function mapCurrentLevelToApi(
  level: PlanLevel,
): PlanCreateBody["currentLevel"] {
  if (level === "advanced") return "ADVANCED";
  if (level === "intermediate") return "INTERMEDIATE";
  return "BEGINNER";
}

export function mapPlanStatus(status: ApiPlanListItem["status"]): PlanStatus {
  if (status === "ACTIVE") return "active";
  if (status === "PAUSED") return "paused";
  if (status === "ARCHIVED") return "archived";
  return "archived";
}

export function mapSessionType(type: "LEARN" | "REVIEW"): PlanSessionType {
  return type === "REVIEW" ? "review" : "session";
}

export function mapSessionStatus(
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "CANCELED",
): PlanSessionStatus {
  if (status === "IN_PROGRESS") return "in_progress";
  if (status === "COMPLETED") return "completed";
  return "todo";
}

export function computeProgressPercent(progress: {
  completedSessions: number;
  totalSessions: number;
}): number {
  if (progress.totalSessions <= 0) return 0;
  return Math.round(
    (progress.completedSessions / progress.totalSessions) * 100,
  );
}

export function toPlanFromListItem(
  item: ApiPlanListItem,
  spaceId: string,
): PlanWithDerived {
  return {
    id: item.id,
    spaceId,
    title: item.title,
    goal: mapGoalType(item.goalType),
    level: mapCurrentLevel(item.currentLevel),
    status: mapPlanStatus(item.status),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    sourceMaterialIds: item.sourceMaterialIds,
    modules: [],
    totalSessions: item.progress.totalSessions,
    progressPercent: computeProgressPercent(item.progress),
  };
}

export function toPlanFromDetail(detail: ApiPlanDetail): PlanWithDerived {
  const sessionsByModuleId = new Map<
    string,
    Array<ApiPlanDetail["sessions"][number]>
  >();

  for (const session of detail.sessions) {
    const moduleId = session.moduleId;
    const existing = sessionsByModuleId.get(moduleId ?? "no-module") ?? [];
    existing.push(session);
    sessionsByModuleId.set(moduleId ?? "no-module", existing);
  }

  const modules = detail.modules
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((module) => {
      const sessions = (sessionsByModuleId.get(module.id) ?? [])
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((session) => ({
          id: session.id,
          moduleId: session.moduleId,
          title: session.title,
          type: mapSessionType(session.sessionType),
          scheduledDate: session.scheduledForDate,
          durationMinutes: session.estimatedMinutes,
          status: mapSessionStatus(session.status),
          completedAt: session.completedAt ?? undefined,
          conceptIds: session.conceptIds,
        }));

      return {
        id: module.id,
        title: module.title,
        summary: module.description ?? undefined,
        sessions,
      };
    });

  const totalSessions = detail.progress.totalSessions;
  const progressPercent = computeProgressPercent(detail.progress);

  return {
    id: detail.id,
    spaceId: detail.spaceId,
    title: detail.title,
    goal: mapGoalType(detail.goalType),
    level: mapCurrentLevel(detail.currentLevel),
    status: mapPlanStatus(detail.status),
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    sourceMaterialIds: detail.sourceMaterialIds,
    modules,
    totalSessions,
    progressPercent,
  };
}
