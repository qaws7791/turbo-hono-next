import { useMutation } from "@tanstack/react-query";


import {
  abandonSessionRun,
  completeSessionRun,
  saveSessionRunProgress,
  startSessionRun,
} from "./api";

import type {
  AbandonRunBody,
  AbandonRunResponse,
  CompleteRunResponse,
  SaveProgressBody,
  SaveProgressResponse,
  StartSessionRunResponseCreated,
  StartSessionRunResponseOk,
} from "./types";
import type { ApiError } from "~/modules/api";

export function useStartSessionRunMutation() {
  return useMutation<
    StartSessionRunResponseOk | StartSessionRunResponseCreated,
    ApiError,
    { sessionId: string; idempotencyKey?: string }
  >({
    mutationFn: startSessionRun,
  });
}

export function useSaveSessionRunProgressMutation() {
  return useMutation<
    SaveProgressResponse,
    ApiError,
    { runId: string; body: SaveProgressBody }
  >({
    mutationFn: saveSessionRunProgress,
  });
}

export function useCompleteSessionRunMutation() {
  return useMutation<CompleteRunResponse, ApiError, { runId: string }>({
    mutationFn: ({ runId }) => completeSessionRun(runId),
  });
}

export function useAbandonSessionRunMutation() {
  return useMutation<
    AbandonRunResponse,
    ApiError,
    { runId: string; body?: AbandonRunBody }
  >({
    mutationFn: abandonSessionRun,
  });
}

