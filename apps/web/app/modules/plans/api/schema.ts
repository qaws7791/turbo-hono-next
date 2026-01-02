import type { paths } from "~/modules/api";

export type SpacePlansApiResponse =
  paths["/api/spaces/{spaceId}/plans"]["get"]["responses"][200]["content"]["application/json"];

export type CreatePlanApiBody = NonNullable<
  paths["/api/spaces/{spaceId}/plans"]["post"]["requestBody"]
>["content"]["application/json"];

export type CreatePlanApiResponse =
  paths["/api/spaces/{spaceId}/plans"]["post"]["responses"][201]["content"]["application/json"];

export type PlanDetailApiResponse =
  paths["/api/plans/{planId}"]["get"]["responses"][200]["content"]["application/json"];

export type PlanStatusApiBody = NonNullable<
  paths["/api/plans/{planId}/status"]["patch"]["requestBody"]
>["content"]["application/json"];

export type UpdatePlanSessionApiBody = NonNullable<
  paths["/api/sessions/{sessionId}"]["patch"]["requestBody"]
>["content"]["application/json"];

export type UpdatePlanSessionApiResponse =
  paths["/api/sessions/{sessionId}"]["patch"]["responses"][200]["content"]["application/json"];
