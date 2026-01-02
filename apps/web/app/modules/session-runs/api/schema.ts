import type { paths } from "~/modules/api";

export type StartSessionRunApiResponseOk =
  paths["/api/sessions/{sessionId}/runs"]["post"]["responses"][200]["content"]["application/json"];

export type StartSessionRunApiResponseCreated =
  paths["/api/sessions/{sessionId}/runs"]["post"]["responses"][201]["content"]["application/json"];

export type SaveProgressApiBody = NonNullable<
  paths["/api/session-runs/{runId}/progress"]["patch"]["requestBody"]
>["content"]["application/json"];

export type SaveProgressApiResponse =
  paths["/api/session-runs/{runId}/progress"]["patch"]["responses"][200]["content"]["application/json"];

export type CompleteRunApiResponse =
  paths["/api/session-runs/{runId}/complete"]["post"]["responses"][200]["content"]["application/json"];

export type SessionRunDetailApiResponse =
  paths["/api/session-runs/{runId}"]["get"]["responses"][200]["content"]["application/json"];

export type SessionRunsListApiQuery =
  paths["/api/session-runs"]["get"]["parameters"]["query"];

export type SessionRunsListApiResponse =
  paths["/api/session-runs"]["get"]["responses"][200]["content"]["application/json"];

export type SessionRunCheckinsApiResponse =
  paths["/api/session-runs/{runId}/checkins"]["get"]["responses"][200]["content"]["application/json"];

export type CreateSessionRunCheckinApiBody = NonNullable<
  paths["/api/session-runs/{runId}/checkins"]["post"]["requestBody"]
>["content"]["application/json"];

export type CreateSessionRunCheckinApiResponse =
  paths["/api/session-runs/{runId}/checkins"]["post"]["responses"][201]["content"]["application/json"];

export type SessionRunActivitiesApiResponse =
  paths["/api/session-runs/{runId}/activities"]["get"]["responses"][200]["content"]["application/json"];

export type CreateSessionRunActivityApiBody = NonNullable<
  paths["/api/session-runs/{runId}/activities"]["post"]["requestBody"]
>["content"]["application/json"];

export type CreateSessionRunActivityApiResponse =
  paths["/api/session-runs/{runId}/activities"]["post"]["responses"][201]["content"]["application/json"];

export type AbandonRunApiBody = NonNullable<
  paths["/api/session-runs/{runId}/abandon"]["post"]["requestBody"]
>["content"]["application/json"];

export type AbandonRunApiResponse =
  paths["/api/session-runs/{runId}/abandon"]["post"]["responses"][200]["content"]["application/json"];
