import { queryOptions } from "@tanstack/react-query";

import type { paths } from "~/foundation/types/api";
import type {
  SessionBlueprint,
  SessionRunInput,
  SessionStep,
} from "./model/types";

import { apiClient } from "~/foundation/api/client";
import { ApiError } from "~/foundation/api/error";

type SessionRunDetail =
  paths["/api/session-runs/{runId}"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

function mapApiBlueprintToUiBlueprint(
  detail: SessionRunDetail,
): SessionBlueprint {
  const steps = detail.blueprint.steps as unknown as Array<SessionStep>;
  const startIndex = Math.max(
    0,
    Math.min(steps.length - 1, detail.blueprint.startStepIndex ?? 0),
  );
  const startStepId = steps[startIndex]?.id ?? steps[0]?.id ?? "start";

  const moduleId = detail.session.module?.id ?? null;

  return {
    schemaVersion: detail.blueprint.schemaVersion,
    blueprintId: detail.blueprint.blueprintId,
    createdAt: detail.blueprint.createdAt,
    context: {
      planId: detail.session.plan.id,
      moduleId,
      planSessionId: detail.session.sessionId,
      sessionType:
        detail.session.sessionType === "REVIEW" ? "review" : "session",
    },
    timeBudget: {
      targetMinutes: detail.session.estimatedMinutes,
      minMinutes: Math.max(
        1,
        Math.floor(detail.session.estimatedMinutes * 0.6),
      ),
      maxMinutes: Math.max(1, Math.ceil(detail.session.estimatedMinutes * 1.4)),
      profile: "STANDARD",
    },
    steps,
    startStepId,
  };
}

async function getSessionRun(runId: string): Promise<SessionRunInput> {
  const { data, error, response } = await apiClient.GET(
    "/api/session-runs/{runId}",
    { params: { path: { runId } } },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to fetch session run", response.status, error);
  }

  const detail = data.data;
  const blueprint = mapApiBlueprintToUiBlueprint(detail);
  const steps = blueprint.steps;

  const currentIndex = Math.max(
    0,
    Math.min(steps.length - 1, detail.progress.stepIndex),
  );
  const stepHistory = steps.slice(0, currentIndex + 1).map((s) => s.id);
  const currentStepId =
    stepHistory[stepHistory.length - 1] ?? blueprint.startStepId;

  return {
    runId: detail.runId,
    planId: detail.session.plan.id,
    sessionId: detail.session.sessionId,
    blueprintId: detail.blueprint.blueprintId,
    isRecovery: false,
    createdAt: detail.startedAt,
    updatedAt: detail.progress.savedAt ?? detail.startedAt,
    currentStepId,
    stepHistory,
    historyIndex: Math.max(0, stepHistory.length - 1),
    inputs: detail.progress.inputs,
    createdConceptIds: detail.createdConceptIds,
    status: detail.status === "RUNNING" ? "ACTIVE" : "COMPLETED",
    planTitle: detail.session.plan.title,
    moduleTitle: detail.session.module?.title ?? "",
    sessionTitle: detail.session.title,
    blueprint,
  };
}

export const sessionQueries = {
  all: () => ["session"] as const,
  runs: () => [...sessionQueries.all(), "run"] as const,

  run: (runId: string) =>
    queryOptions({
      queryKey: [...sessionQueries.runs(), runId] as const,
      queryFn: (): Promise<SessionRunInput> => getSessionRun(runId),
    }),
};
