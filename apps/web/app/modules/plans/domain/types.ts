import type {
  CreatePlanApiBody,
  CreatePlanApiResponse,
  PlanDetailApiResponse,
  PlanStatusApiBody,
  SpacePlansApiResponse,
  UpdatePlanSessionApiBody,
  UpdatePlanSessionApiResponse,
} from "../api/schema";

export type PlanListItem = SpacePlansApiResponse["data"][number];

export type PlanStatus = PlanListItem["status"];

export type PlanGoalType = PlanListItem["goalType"];

export type PlanCurrentLevel = PlanDetailApiResponse["data"]["currentLevel"];

export type PlansListMeta = SpacePlansApiResponse["meta"];

export type SpacePlansResponse = SpacePlansApiResponse;

export type CreatePlanBody = CreatePlanApiBody;

export type CreatePlanResponse = CreatePlanApiResponse;

export type PlanDetail = PlanDetailApiResponse["data"];

export type PlanDetailResponse = PlanDetailApiResponse;

export type PlanStatusBody = PlanStatusApiBody;

export type UpdatePlanSessionBody = UpdatePlanSessionApiBody;

export type UpdatePlanSessionResponse = UpdatePlanSessionApiResponse["data"];
