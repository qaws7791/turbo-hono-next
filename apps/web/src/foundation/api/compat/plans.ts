import { apiClient } from "../client";
import { ApiError } from "../error";

import type { paths } from "~/foundation/types/api";
import type {
  Plan,
  PlanGoal,
  PlanLevel,
  PlanSessionStatus,
  PlanSessionType,
  PlanStatus,
} from "~/app/mocks/schemas";

import { nowIso } from "~/foundation/lib/time";
import { randomUuidV4 } from "~/foundation/lib/uuid";

export type PlanWithDerived = Plan & {
  progressPercent: number;
  totalSessions: number;
};

type PlanListOk =
  paths["/api/spaces/{spaceId}/plans"]["get"]["responses"]["200"]["content"]["application/json"];
type ApiPlanListItem = PlanListOk["data"][number];

type PlanDetailOk =
  paths["/api/plans/{planId}"]["get"]["responses"]["200"]["content"]["application/json"];
type ApiPlanDetail = PlanDetailOk["data"];

function mapGoalType(goalType: ApiPlanListItem["goalType"]): PlanGoal {
  if (goalType === "JOB") return "career";
  if (goalType === "CERT") return "certificate";
  if (goalType === "WORK") return "work";
  return "hobby";
}

function mapCurrentLevel(level: ApiPlanDetail["currentLevel"]): PlanLevel {
  if (level === "ADVANCED") return "advanced";
  if (level === "INTERMEDIATE") return "intermediate";
  return "novice";
}

function mapPlanStatus(status: ApiPlanListItem["status"]): PlanStatus {
  if (status === "ACTIVE") return "active";
  if (status === "PAUSED") return "paused";
  if (status === "ARCHIVED") return "archived";
  return "archived";
}

function mapSessionType(type: "LEARN" | "REVIEW"): PlanSessionType {
  return type === "REVIEW" ? "review" : "session";
}

function mapSessionStatus(
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "CANCELED",
): PlanSessionStatus {
  if (status === "IN_PROGRESS") return "in_progress";
  if (status === "COMPLETED") return "completed";
  return "todo";
}

function computeProgressPercent(progress: {
  completedSessions: number;
  totalSessions: number;
}): number {
  if (progress.totalSessions <= 0) return 0;
  return Math.round(
    (progress.completedSessions / progress.totalSessions) * 100,
  );
}

function mapPlanListItemToUiPlan(
  item: ApiPlanListItem,
  spaceId: string,
): PlanWithDerived {
  const createdAt = nowIso();
  const updatedAt = createdAt;
  return {
    id: item.id,
    spaceId,
    title: item.title,
    goal: mapGoalType(item.goalType),
    level: "novice",
    status: mapPlanStatus(item.status),
    createdAt,
    updatedAt,
    sourceDocumentIds: [],
    modules: [],
    totalSessions: item.progress.totalSessions,
    progressPercent: computeProgressPercent(item.progress),
  };
}

function mapPlanDetailToUiPlan(detail: ApiPlanDetail): PlanWithDerived {
  const createdAt = nowIso();
  const updatedAt = createdAt;

  const sessionsByModuleId = new Map<
    string,
    Array<ApiPlanDetail["sessions"][number]>
  >();

  for (const session of detail.sessions) {
    const moduleId = session.moduleId ?? "00000000-0000-0000-0000-000000000000";
    const arr = sessionsByModuleId.get(moduleId) ?? [];
    arr.push(session);
    sessionsByModuleId.set(moduleId, arr);
  }

  const modules = detail.modules
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((module) => {
      const sessions = (sessionsByModuleId.get(module.id) ?? [])
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((s) => ({
          id: s.id,
          moduleId: module.id,
          blueprintId: randomUuidV4(),
          title: s.title,
          type: mapSessionType(s.sessionType),
          scheduledDate: s.scheduledForDate,
          durationMinutes: s.estimatedMinutes,
          status: mapSessionStatus(s.status),
          completedAt: s.completedAt ?? undefined,
          conceptIds: [],
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
    createdAt,
    updatedAt,
    sourceDocumentIds: [],
    modules,
    totalSessions,
    progressPercent,
  };
}

export async function listPlansForUi(
  spaceId: string,
): Promise<Array<PlanWithDerived>> {
  const { data, error, response } = await apiClient.GET(
    "/api/spaces/{spaceId}/plans",
    { params: { path: { spaceId } } },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to list plans", response.status, error);
  }
  return data.data.map((item) => mapPlanListItemToUiPlan(item, spaceId));
}

export async function getPlanForUi(planId: string): Promise<PlanWithDerived> {
  const { data, error, response } = await apiClient.GET("/api/plans/{planId}", {
    params: { path: { planId } },
  });
  if (!response.ok || !data) {
    throw new ApiError("Failed to get plan", response.status, error);
  }
  return mapPlanDetailToUiPlan(data.data);
}

export async function getActivePlanForSpaceUi(
  spaceId: string,
): Promise<PlanWithDerived | null> {
  const { data, error, response } = await apiClient.GET(
    "/api/spaces/{spaceId}/plans",
    { params: { path: { spaceId }, query: { status: "ACTIVE", limit: 1 } } },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to list active plans", response.status, error);
  }
  const first = data.data[0];
  return first ? mapPlanListItemToUiPlan(first, spaceId) : null;
}
