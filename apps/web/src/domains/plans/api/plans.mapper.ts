import type {
  PlanGenerationStatus,
  PlanSessionStatus,
  PlanSessionType,
  PlanStatus,
  PlanWithDerived,
} from "../model/types";
import type { ApiPlanDetail, ApiPlanListItem } from "./plans.dto";

// Mappers for goal and level are removed

export function mapPlanStatus(status: ApiPlanListItem["status"]): PlanStatus {
  if (status === "ACTIVE") return "active";
  if (status === "PAUSED") return "paused";
  if (status === "ARCHIVED") return "archived";
  if (status === "COMPLETED") return "completed";
  return "archived";
}

export function mapPlanGenerationStatus(
  status: ApiPlanListItem["generationStatus"],
): PlanGenerationStatus {
  if (status === "READY") return "ready";
  if (status === "FAILED") return "failed";
  if (status === "GENERATING") return "generating";
  return "pending";
}

export function mapSessionType(): PlanSessionType {
  return "session";
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

function isTextMimeType(mimeType: string | null | undefined): boolean {
  if (!mimeType) return false;
  return (
    mimeType.startsWith("text/") ||
    mimeType.includes("markdown") ||
    mimeType.includes("json") ||
    mimeType.includes("xml")
  );
}

export function toPlanFromListItem(item: ApiPlanListItem): PlanWithDerived {
  return {
    id: item.id,
    title: item.title,
    icon: item.icon,
    color: item.color,
    status: mapPlanStatus(item.status),
    generationStatus: mapPlanGenerationStatus(item.generationStatus),
    generationProgress: item.generationProgress ?? null,
    generationStep: item.generationStep ?? null,
    generationError: item.generationError ?? null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    sourceMaterialIds: item.sourceMaterialIds,
    materials: [],
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
          type: mapSessionType(),
          scheduledDate: session.scheduledForDate,
          durationMinutes: session.estimatedMinutes,
          status: mapSessionStatus(session.status),
          completedAt: session.completedAt ?? undefined,
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
    title: detail.title,
    icon: detail.icon,
    color: detail.color,
    status: mapPlanStatus(detail.status),
    generationStatus: mapPlanGenerationStatus(detail.generationStatus),
    generationProgress: detail.generationProgress ?? null,
    generationStep: detail.generationStep ?? null,
    generationError: detail.generationError ?? null,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    progressPercent,
    totalSessions,
    sourceMaterialIds: detail.sourceMaterialIds,
    materials: (detail.materials ?? []).map((m) => {
      const isText = isTextMimeType(m.mimeType);
      return {
        id: m.id,
        title: m.title,
        summary: m.summary ?? undefined,
        kind: isText ? "text" : "file",
      };
    }),
    modules,
  };
}
