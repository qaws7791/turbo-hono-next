import { useMutation } from "@tanstack/react-query";

import {
  abandonSessionRun,
  completeSessionRun,
  createSessionRunActivity,
  createSessionRunCheckin,
  saveSessionRunProgress,
  startSessionRun,
} from "../api";

import type { ApiError } from "~/modules/api";
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
  StartSessionRunResponseCreated,
  StartSessionRunResponseOk,
} from "../domain";

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

export function useCreateSessionRunCheckinMutation() {
  return useMutation<
    CreateRunCheckinResponse,
    ApiError,
    { runId: string; body: CreateRunCheckinBody }
  >({
    mutationFn: createSessionRunCheckin,
  });
}

export function useCreateSessionRunActivityMutation() {
  return useMutation<
    CreateRunActivityResponse,
    ApiError,
    { runId: string; body: CreateRunActivityBody }
  >({
    mutationFn: createSessionRunActivity,
  });
}
