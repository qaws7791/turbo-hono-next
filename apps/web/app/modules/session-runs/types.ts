import type { paths } from "~/types/api";

export type StartSessionRunResponseCreated =
  paths["/api/sessions/{sessionId}/runs"]["post"]["responses"][201]["content"]["application/json"];
export type StartSessionRunResponseOk =
  paths["/api/sessions/{sessionId}/runs"]["post"]["responses"][200]["content"]["application/json"];

export type SessionRunStartData = StartSessionRunResponseOk["data"];

export type SaveProgressBody = NonNullable<
  paths["/api/session-runs/{runId}/progress"]["patch"]["requestBody"]
>["content"]["application/json"];

export type SaveProgressResponse =
  paths["/api/session-runs/{runId}/progress"]["patch"]["responses"][200]["content"]["application/json"];

export type CompleteRunResponse =
  paths["/api/session-runs/{runId}/complete"]["post"]["responses"][200]["content"]["application/json"];

export type AbandonRunBody = NonNullable<
  paths["/api/session-runs/{runId}/abandon"]["post"]["requestBody"]
>["content"]["application/json"];

export type AbandonRunResponse =
  paths["/api/session-runs/{runId}/abandon"]["post"]["responses"][200]["content"]["application/json"];

