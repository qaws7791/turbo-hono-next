import type {
  AbandonRunApiBody,
  AbandonRunApiResponse,
  CompleteRunApiResponse,
  CreateSessionRunActivityApiBody,
  CreateSessionRunActivityApiResponse,
  CreateSessionRunCheckinApiBody,
  CreateSessionRunCheckinApiResponse,
  SaveProgressApiBody,
  SaveProgressApiResponse,
  SessionRunActivitiesApiResponse,
  SessionRunCheckinsApiResponse,
  SessionRunDetailApiResponse,
  SessionRunsListApiQuery,
  SessionRunsListApiResponse,
  StartSessionRunApiResponseCreated,
  StartSessionRunApiResponseOk,
} from "../api/schema";

export type SessionRunStartData = StartSessionRunApiResponseOk["data"];

export type SessionRunStatus = SessionRunStartData["status"];

export type StartSessionRunResponseCreated = StartSessionRunApiResponseCreated;

export type StartSessionRunResponseOk = StartSessionRunApiResponseOk;

export type SaveProgressBody = SaveProgressApiBody;

export type SaveProgressResponse = SaveProgressApiResponse;

export type CompleteRunResponse = CompleteRunApiResponse;

export type SessionRunDetailResponse = SessionRunDetailApiResponse;

export type SessionRunsListQuery = SessionRunsListApiQuery;

export type SessionRunsListResponse = SessionRunsListApiResponse;

export type SessionRunCheckinsResponse = SessionRunCheckinsApiResponse;

export type SessionRunActivitiesResponse = SessionRunActivitiesApiResponse;

export type CreateRunCheckinBody = CreateSessionRunCheckinApiBody;

export type CreateRunCheckinResponse = CreateSessionRunCheckinApiResponse;

export type CreateRunActivityBody = CreateSessionRunActivityApiBody;

export type CreateRunActivityResponse = CreateSessionRunActivityApiResponse;

export type AbandonRunReason = AbandonRunApiBody["reason"];

export type AbandonRunBody = AbandonRunApiBody;

export type AbandonRunResponse = AbandonRunApiResponse;
