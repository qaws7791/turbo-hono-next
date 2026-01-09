import type { paths } from "~/foundation/types/api";

export type PlansListQuery = paths["/api/plans"]["get"]["parameters"]["query"];

export type PlansListOk =
  paths["/api/plans"]["get"]["responses"]["200"]["content"]["application/json"];

export type ApiPlanListItem = PlansListOk["data"][number];

export type PlanDetailOk =
  paths["/api/plans/{planId}"]["get"]["responses"]["200"]["content"]["application/json"];

export type ApiPlanDetail = PlanDetailOk["data"];

export type PlanActivateOk =
  paths["/api/plans/{planId}/activate"]["post"]["responses"]["200"]["content"]["application/json"];

type PlanStatusUpdateRequestBody = NonNullable<
  paths["/api/plans/{planId}/status"]["patch"]["requestBody"]
>;

export type PlanStatusUpdateBody =
  PlanStatusUpdateRequestBody["content"]["application/json"];

export type PlanStatusUpdateOk =
  paths["/api/plans/{planId}/status"]["patch"]["responses"]["200"]["content"]["application/json"];

type PlanCreateRequestBody = NonNullable<
  paths["/api/plans"]["post"]["requestBody"]
>;

export type PlanCreateBody =
  PlanCreateRequestBody["content"]["application/json"];

export type PlanCreateCreated =
  paths["/api/plans"]["post"]["responses"]["201"]["content"]["application/json"]["data"];
