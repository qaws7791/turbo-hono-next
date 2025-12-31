import type {
  AbandonRunBody,
  AbandonRunResponse,
  CompleteRunResponse,
  SaveProgressBody,
  SaveProgressResponse,
  SessionRunStartData,
  StartSessionRunResponseCreated,
  StartSessionRunResponseOk,
} from "./types";

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

export async function completeSessionRun(runId: string): Promise<CompleteRunResponse> {
  const result = await apiClient.POST("/api/session-runs/{runId}/complete", {
    params: { path: { runId } },
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

