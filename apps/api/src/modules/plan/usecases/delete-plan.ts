import { err, ok, safeTry } from "neverthrow";

import { parseOrInternalError } from "../../../lib/zod";
import { ApiError } from "../../../middleware/error-handler";
import { DeletePlanResponse } from "../plan.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { DeletePlanResponse as DeletePlanResponseType } from "../plan.dto";
import type { PlanRepository } from "../plan.repository";

export function deletePlan(deps: { readonly planRepository: PlanRepository }) {
  return function deletePlan(
    userId: string,
    planId: string,
  ): ResultAsync<DeletePlanResponseType, AppError> {
    return safeTry(async function* () {
      const plan = yield* deps.planRepository.findByPublicId(userId, planId);
      if (!plan) {
        return err(
          new ApiError(404, "PLAN_NOT_FOUND", "Plan을 찾을 수 없습니다.", {
            planId,
          }),
        );
      }

      const materialIds = yield* deps.planRepository.listSourceMaterialIds(
        plan.id,
      );

      yield* deps.planRepository.deletePlan(plan.id);
      yield* deps.planRepository.gcZombieMaterials(materialIds);

      const response = yield* parseOrInternalError(
        DeletePlanResponse,
        { message: "Plan이 삭제되었습니다." },
        "DeletePlanResponse",
      );
      return ok(response);
    });
  };
}
