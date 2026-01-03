import { apiClient } from "../client";
import { ApiError } from "../error";

import type { SessionRunInput } from "~/features/session/types";
import type { SessionBlueprint, SessionStep } from "~/mock/schemas";
import type { paths } from "~/types/api";

import { randomUuidV4 } from "~/lib/uuid";

type SessionRunDetail =
  paths["/api/session-runs/{runId}"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

type CreateRunOk =
  | paths["/api/sessions/{sessionId}/runs"]["post"]["responses"]["200"]["content"]["application/json"]["data"]
  | paths["/api/sessions/{sessionId}/runs"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

function mapApiBlueprintToUiBlueprint(
  detail: SessionRunDetail,
): SessionBlueprint {
  const steps = detail.blueprint.steps as unknown as Array<SessionStep>;
  const startIndex = Math.max(
    0,
    Math.min(steps.length - 1, detail.blueprint.startStepIndex ?? 0),
  );
  const startStepId = steps[startIndex]?.id ?? steps[0]?.id ?? "start";

  const moduleId =
    detail.session.module?.id ?? "00000000-0000-0000-0000-000000000000";

  return {
    schemaVersion: detail.blueprint.schemaVersion,
    blueprintId: "00000000-0000-0000-0000-000000000000",
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

export async function createOrResumeSessionRun(sessionId: string): Promise<{
  runId: string;
  isRecovery: boolean;
}> {
  const { data, error, response } = await apiClient.POST(
    "/api/sessions/{sessionId}/runs",
    {
      params: { path: { sessionId } },
      headers: { "Idempotency-Key": randomUuidV4() },
    },
  );
  if (!response.ok || !data) {
    throw new ApiError("Failed to create session run", response.status, error);
  }

  const run = data.data as CreateRunOk;
  return { runId: run.runId, isRecovery: run.isRecovery };
}

export async function getSessionRunForUi(
  runId: string,
): Promise<SessionRunInput> {
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
    blueprintId: randomUuidV4(),
    isRecovery: false,
    createdAt: detail.startedAt,
    updatedAt: detail.progress.savedAt ?? detail.startedAt,
    currentStepId,
    stepHistory,
    historyIndex: Math.max(0, stepHistory.length - 1),
    inputs: detail.progress.inputs,
    createdConceptIds: [],
    status: detail.status === "RUNNING" ? "ACTIVE" : "COMPLETED",
    planTitle: detail.session.plan.title,
    moduleTitle: detail.session.module?.title ?? "",
    sessionTitle: detail.session.title,
    blueprint,
  };
}
