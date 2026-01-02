import type {
  AbandonRunBody,
  AbandonRunResponse,
  CompleteRunResponse,
  CreateRunActivityBody,
  CreateRunActivityResponse,
  CreateRunCheckinBody,
  CreateRunCheckinResponse,
  SaveProgressBody,
  SaveProgressResponse,
  SessionRunActivitiesResponse,
  SessionRunCheckinsResponse,
  SessionRunDetailResponse,
  SessionRunStartData,
  SessionRunsListQuery,
  SessionRunsListResponse,
  StartSessionRunResponseCreated,
  StartSessionRunResponseOk,
} from "../domain";

import { apiClient, unwrap } from "~/modules/api";

export async function startSessionRun(input: {
  sessionId: string;
  idempotencyKey?: string;
}): Promise<StartSessionRunResponseOk | StartSessionRunResponseCreated> {
  const result = await apiClient.POST("/api/sessions/{sessionId}/runs", {
    params: {
      path: { sessionId: input.sessionId },
      header: { "Idempotency-Key": input.idempotencyKey },
    },
  });
  return unwrap(result);
}

export async function saveSessionRunProgress(input: {
  runId: string;
  body: SaveProgressBody;
}): Promise<SaveProgressResponse> {
  const result = await apiClient.PATCH("/api/session-runs/{runId}/progress", {
    params: { path: { runId: input.runId } },
    body: input.body,
  });
  return unwrap(result);
}

export async function completeSessionRun(
  runId: string,
): Promise<CompleteRunResponse> {
  const result = await apiClient.POST("/api/session-runs/{runId}/complete", {
    params: { path: { runId } },
  });
  return unwrap(result);
}

export async function fetchSessionRunDetail(
  runId: string,
): Promise<SessionRunDetailResponse> {
  const result = await apiClient.GET("/api/session-runs/{runId}", {
    params: { path: { runId } },
  });
  return unwrap(result);
}

export async function fetchSessionRuns(
  input?: SessionRunsListQuery,
): Promise<SessionRunsListResponse> {
  const result = await apiClient.GET("/api/session-runs", {
    params: { query: input },
  });
  return unwrap(result);
}

export async function fetchSessionRunCheckins(
  runId: string,
): Promise<SessionRunCheckinsResponse> {
  const result = await apiClient.GET("/api/session-runs/{runId}/checkins", {
    params: { path: { runId } },
  });
  return unwrap(result);
}

export async function createSessionRunCheckin(input: {
  runId: string;
  body: CreateRunCheckinBody;
}): Promise<CreateRunCheckinResponse> {
  const result = await apiClient.POST("/api/session-runs/{runId}/checkins", {
    params: { path: { runId: input.runId } },
    body: input.body,
  });
  return unwrap(result);
}

export async function fetchSessionRunActivities(
  runId: string,
): Promise<SessionRunActivitiesResponse> {
  const result = await apiClient.GET("/api/session-runs/{runId}/activities", {
    params: { path: { runId } },
  });
  return unwrap(result);
}

export async function createSessionRunActivity(input: {
  runId: string;
  body: CreateRunActivityBody;
}): Promise<CreateRunActivityResponse> {
  const result = await apiClient.POST("/api/session-runs/{runId}/activities", {
    params: { path: { runId: input.runId } },
    body: input.body,
  });
  return unwrap(result);
}

export async function abandonSessionRun(input: {
  runId: string;
  body?: AbandonRunBody;
}): Promise<AbandonRunResponse> {
  const result = await apiClient.POST("/api/session-runs/{runId}/abandon", {
    params: { path: { runId: input.runId } },
    body: input.body,
  });
  return unwrap(result);
}

export function isRunStartData(value: unknown): value is SessionRunStartData {
  if (!value || typeof value !== "object") return false;
  if (!("runId" in value)) return false;
  if (!("sessionId" in value)) return false;
  return true;
}
