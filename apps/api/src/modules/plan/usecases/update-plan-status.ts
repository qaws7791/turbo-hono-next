import { err, ok, safeTry } from "neverthrow";

import { parseOrInternalError } from "../../../lib/zod";
import { ApiError } from "../../../middleware/error-handler";
import { UpdatePlanStatusResponse } from "../plan.dto";
import { validateStatusTransition } from "../plan.utils";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  PlanStatus,
  UpdatePlanStatusResponse as UpdatePlanStatusResponseType,
} from "../plan.dto";
import type { PlanRepository } from "../plan.repository";

export function updatePlanStatus(deps: {
  readonly planRepository: PlanRepository;
  readonly activatePlan: (
    userId: string,
    planId: string,
  ) => ResultAsync<{ data: { id: string; status: PlanStatus } }, AppError>;
}) {
  return function updatePlanStatus(
    userId: string,
    planId: string,
    nextStatus: PlanStatus,
  ): ResultAsync<UpdatePlanStatusResponseType, AppError> {
    if (nextStatus === "ACTIVE") {
      return deps.activatePlan(userId, planId);
    }

    return safeTry(async function* () {
      const now = new Date();

      const plan = yield* deps.planRepository.findByPublicId(userId, planId);
      if (!plan) {
        return err(
          new ApiError(404, "PLAN_NOT_FOUND", "Plan을 찾을 수 없습니다.", {
            planId,
          }),
        );
      }

      if (!validateStatusTransition(plan.status, nextStatus)) {
        return err(
          new ApiError(
            400,
            "INVALID_REQUEST",
            "허용되지 않는 상태 전이입니다.",
            {
              from: plan.status,
              to: nextStatus,
            },
          ),
        );
      }

      const materialIds = yield* deps.planRepository.listSourceMaterialIds(
        plan.id,
      );

      yield* deps.planRepository.updatePlanStatusTransaction({
        planId: plan.id,
        status: nextStatus,
        now,
      });

      if (nextStatus === "ARCHIVED") {
        yield* deps.planRepository.gcZombieMaterials(materialIds);
      }

      const response = yield* parseOrInternalError(
        UpdatePlanStatusResponse,
        {
          data: { id: plan.publicId, status: nextStatus },
        },
        "UpdatePlanStatusResponse",
      );

      return ok(response);
    });
  };
}
