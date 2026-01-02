import { useQuery } from "@tanstack/react-query";

import {
  fetchSessionRunActivities,
  fetchSessionRunCheckins,
  fetchSessionRunDetail,
  fetchSessionRuns,
} from "../api";

import { sessionRunKeys } from "./keys";

import type { ApiError } from "~/modules/api";
import type {
  SessionRunActivitiesResponse,
  SessionRunCheckinsResponse,
  SessionRunDetailResponse,
  SessionRunsListQuery,
  SessionRunsListResponse,
} from "../domain";

export function useSessionRunDetailQuery(runId: string) {
  return useQuery<SessionRunDetailResponse, ApiError>({
    queryKey: sessionRunKeys.detail(runId),
    queryFn: () => fetchSessionRunDetail(runId),
    enabled: runId.length > 0,
  });
}

export function useSessionRunCheckinsQuery(
  runId: string,
  options?: { enabled?: boolean },
) {
  return useQuery<SessionRunCheckinsResponse, ApiError>({
    queryKey: sessionRunKeys.checkins(runId),
    queryFn: () => fetchSessionRunCheckins(runId),
    enabled: runId.length > 0 && (options?.enabled ?? true),
  });
}

export function useSessionRunActivitiesQuery(
  runId: string,
  options?: { enabled?: boolean },
) {
  return useQuery<SessionRunActivitiesResponse, ApiError>({
    queryKey: sessionRunKeys.activities(runId),
    queryFn: () => fetchSessionRunActivities(runId),
    enabled: runId.length > 0 && (options?.enabled ?? true),
  });
}

export function useSessionRunsQuery(input?: SessionRunsListQuery) {
  return useQuery<SessionRunsListResponse, ApiError>({
    queryKey: sessionRunKeys.list(input),
    queryFn: () => fetchSessionRuns(input),
  });
}
