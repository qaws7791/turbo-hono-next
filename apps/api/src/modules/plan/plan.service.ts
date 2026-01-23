import { activatePlan } from "./usecases/activate-plan";
import { createPlan } from "./usecases/create-plan";
import { deletePlan } from "./usecases/delete-plan";
import { enqueuePlanGeneration } from "./usecases/enqueue-plan-generation";
import { getPlanDetail } from "./usecases/get-plan-detail";
import { listPlans } from "./usecases/list-plans";
import { updatePlan } from "./usecases/update-plan";
import { updatePlanStatus } from "./usecases/update-plan-status";

import type { Queue } from "bullmq";
import type { ResultAsync } from "neverthrow";
import type {
  PlanGenerationJobData,
  PlanGenerationJobResult,
} from "../../infrastructure/queue";
import type { AppError } from "../../lib/result";
import type { MaterialRepository } from "../material/material.repository";
import type {
  ActivatePlanResponse,
  CreatePlanInput,
  CreatePlanResponse,
  DeletePlanResponse,
  ListPlansInput,
  ListPlansResponse,
  PlanDetailResponse,
  PlanStatus,
  UpdatePlanInput,
  UpdatePlanResponse,
  UpdatePlanStatusResponse,
} from "./plan.dto";
import type { PlanGenerationPort } from "./plan.ports";
import type { PlanRepository } from "./plan.repository";

export type PlanServiceDeps = {
  readonly planRepository: PlanRepository;
  readonly materialRepository: MaterialRepository;
  readonly planGeneration: PlanGenerationPort;
  readonly planGenerationQueue: Queue<
    PlanGenerationJobData,
    PlanGenerationJobResult
  >;
};

export type PlanService = {
  readonly activatePlan: (
    userId: string,
    planId: string,
  ) => ResultAsync<ActivatePlanResponse, AppError>;
  readonly createPlan: (
    userId: string,
    input: CreatePlanInput,
  ) => ResultAsync<CreatePlanResponse, AppError>;
  readonly enqueuePlanGeneration: (
    userId: string,
    input: CreatePlanInput,
  ) => ResultAsync<CreatePlanResponse, AppError>;
  readonly deletePlan: (
    userId: string,
    planId: string,
  ) => ResultAsync<DeletePlanResponse, AppError>;
  readonly getPlanDetail: (
    userId: string,
    planId: string,
  ) => ResultAsync<PlanDetailResponse, AppError>;
  readonly listPlans: (
    userId: string,
    input: ListPlansInput,
  ) => ResultAsync<ListPlansResponse, AppError>;
  readonly updatePlan: (
    userId: string,
    planId: string,
    input: UpdatePlanInput,
  ) => ResultAsync<UpdatePlanResponse, AppError>;
  readonly updatePlanStatus: (
    userId: string,
    planId: string,
    status: PlanStatus,
  ) => ResultAsync<UpdatePlanStatusResponse, AppError>;
};

export function createPlanService(deps: PlanServiceDeps): PlanService {
  const usecaseDeps = {
    planRepository: deps.planRepository,
    materialRepository: deps.materialRepository,
  } as const;
  const activatePlanUsecase = activatePlan(usecaseDeps);

  return {
    activatePlan: activatePlanUsecase,
    createPlan: createPlan({
      planRepository: deps.planRepository,
      planGeneration: deps.planGeneration,
    }),
    enqueuePlanGeneration: enqueuePlanGeneration({
      planRepository: deps.planRepository,
      planGenerationQueue: deps.planGenerationQueue,
    }),
    deletePlan: deletePlan(usecaseDeps),
    getPlanDetail: getPlanDetail(usecaseDeps),
    listPlans: listPlans(usecaseDeps),
    updatePlan: updatePlan(usecaseDeps),
    updatePlanStatus: updatePlanStatus({
      planRepository: deps.planRepository,
      activatePlan: activatePlanUsecase,
    }),
  };
}
