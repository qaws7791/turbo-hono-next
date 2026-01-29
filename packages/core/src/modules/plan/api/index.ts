import { activatePlan } from "../internal/application/activate-plan";
import { createPlan } from "../internal/application/create-plan";
import { deletePlan } from "../internal/application/delete-plan";
import { enqueuePlanGeneration } from "../internal/application/enqueue-plan-generation";
import { getPlanDetail } from "../internal/application/get-plan-detail";
import { listPlans } from "../internal/application/list-plans";
import { createPlanProcessor } from "../internal/application/process-plan-generation";
import { updatePlan } from "../internal/application/update-plan";
import { updatePlanStatus } from "../internal/application/update-plan-status";
import { createPlanRepository } from "../internal/infrastructure/plan.repository";
import { createPlanGenerationAdapter } from "../internal/infrastructure/adapters/plan-generation.adapter";

import type { Database } from "@repo/database";
import type { ChatModelPort } from "@repo/ai";
import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../common/result";
import type {
  PlanGenerationJobData,
  PlanGenerationJobResult,
  PlanGenerationProgress,
} from "./queue.types";
import type { PlanGenerationPort } from "./plan-generation.port";
import type { PlanGenerationQueuePort } from "./plan-generation-queue.port";
import type { MaterialReaderPort } from "./ports/material-reader.port";
import type { PlanLoggerPort } from "./ports/plan-logger.port";
import type { PlanStatus } from "../internal/domain/plan.types";
import type { KnowledgeFacade } from "../../knowledge/api";

export type {
  PlanGenerationJobData,
  PlanGenerationJobResult,
  PlanGenerationProgress,
} from "./queue.types";

export type { PlanGenerationPort } from "./plan-generation.port";
export type { PlanGenerationQueuePort } from "./plan-generation-queue.port";
export type { MaterialReaderPort } from "./ports/material-reader.port";
export type { PlanLoggerPort } from "./ports/plan-logger.port";
export type {
  PlanStatus,
  PlanGenerationStatus,
} from "../internal/domain/plan.types";

export type CreatePlanInput = {
  materialIds: Array<string>;
  targetDueDate: string | null;
  specialRequirements?: string;
  icon?: string;
  color?: string;
};

export type UpdatePlanInput = {
  title?: string;
  icon?: string;
  color?: string;
  status?: PlanStatus;
};

export type ListPlansInput = {
  page: number;
  limit: number;
  status?: PlanStatus;
};

export type CreatePlanResponse = {
  data: {
    id: string;
    title: string;
    icon: string;
    color: string;
    status: PlanStatus;
    generationStatus: "PENDING" | "GENERATING" | "READY" | "FAILED";
    generationProgress: number | null;
    generationStep: string | null;
    generationError: string | null;
    jobId?: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type PlanProgress = {
  completedSessions: number;
  totalSessions: number;
};

export type ListPlansResponse = {
  data: Array<{
    id: string;
    title: string;
    icon: string;
    color: string;
    status: PlanStatus;
    generationStatus: "PENDING" | "GENERATING" | "READY" | "FAILED";
    generationProgress: number | null;
    generationStep: string | null;
    generationError: string | null;
    createdAt: string;
    updatedAt: string;
    progress: PlanProgress;
    sourceMaterialIds: Array<string>;
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};

export type PlanDetailResponse = {
  data: {
    id: string;
    title: string;
    icon: string;
    color: string;
    status: PlanStatus;
    generationStatus: "PENDING" | "GENERATING" | "READY" | "FAILED";
    generationProgress: number | null;
    generationStep: string | null;
    generationError: string | null;
    jobId?: string;
    targetDueDate: string | null;
    specialRequirements: string | null;
    createdAt: string;
    updatedAt: string;
    progress: PlanProgress;
    sourceMaterialIds: Array<string>;
    materials: Array<{
      id: string;
      title: string;
      summary: string | null;
      mimeType: string | null;
    }>;
    modules: Array<{
      id: string;
      title: string;
      description: string | null;
      orderIndex: number;
    }>;
    sessions: Array<{
      id: string;
      moduleId: string | null;
      sessionType: "LEARN";
      title: string;
      objective: string | null;
      orderIndex: number;
      scheduledForDate: string;
      estimatedMinutes: number;
      status:
        | "SCHEDULED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "SKIPPED"
        | "CANCELED";
      completedAt: string | null;
    }>;
  };
};

export type UpdatePlanResponse = {
  data: {
    id: string;
    title: string;
    icon: string;
    color: string;
    status: PlanStatus;
  };
};

export type UpdatePlanStatusResponse = {
  data: { id: string; status: PlanStatus };
};

export type ActivatePlanResponse = {
  data: { id: string; status: "ACTIVE" };
};

export type DeletePlanResponse = { message: string };

export type CreatePlanServiceDeps = {
  readonly db: Database;
  readonly planGeneration: PlanGenerationPort;
  readonly planGenerationQueue: PlanGenerationQueuePort;
  readonly materialReader: MaterialReaderPort;
};

export function createAiPlanGeneration(params: {
  readonly logger: PlanLoggerPort;
  readonly materialReader: MaterialReaderPort;
  readonly knowledge: KnowledgeFacade;
  readonly chatModel: ChatModelPort;
}): PlanGenerationPort {
  return createPlanGenerationAdapter(params);
}

export function createPlanService(deps: CreatePlanServiceDeps): PlanService {
  const planRepository = createPlanRepository(deps.db);

  const activatePlanUsecase = activatePlan({ planRepository });

  return {
    activatePlan: activatePlanUsecase,
    createPlan: createPlan({
      planRepository,
      planGeneration: deps.planGeneration,
    }),
    enqueuePlanGeneration: enqueuePlanGeneration({
      planRepository,
      planGenerationQueue: deps.planGenerationQueue,
    }),
    deletePlan: deletePlan({ planRepository }),
    getPlanDetail: getPlanDetail({
      planRepository,
      materialReader: deps.materialReader,
    }),
    listPlans: listPlans({ planRepository }),
    updatePlan: updatePlan({ planRepository }),
    updatePlanStatus: updatePlanStatus({
      planRepository,
      activatePlan: activatePlanUsecase,
    }),
    createPlanProcessor: createPlanProcessor({
      planRepository,
      planGeneration: deps.planGeneration,
    }),
  };
}

export type {
  ActivatePlanResponse as ActivatePlanResponseType,
  CreatePlanResponse as CreatePlanResponseType,
  DeletePlanResponse as DeletePlanResponseType,
  ListPlansInput as ListPlansInputType,
  ListPlansResponse as ListPlansResponseType,
  PlanDetailResponse as PlanDetailResponseType,
  UpdatePlanInput as UpdatePlanInputType,
  UpdatePlanResponse as UpdatePlanResponseType,
  UpdatePlanStatusResponse as UpdatePlanStatusResponseType,
};

export type PlanServiceMethods = {
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

export type PlanGenerationProcessor = (
  jobData: PlanGenerationJobData,
  updateProgress: (
    step: PlanGenerationProgress["step"],
    progress: number,
    message?: string,
  ) => Promise<void>,
) => ResultAsync<PlanGenerationJobResult, AppError>;

export type PlanService = PlanServiceMethods & {
  readonly createPlanProcessor: PlanGenerationProcessor;
};
