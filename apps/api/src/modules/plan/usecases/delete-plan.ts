import { tryPromise, unwrap } from "../../../lib/result";
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
    return tryPromise(async () => {
      const plan = await unwrap(
        deps.planRepository.findByPublicId(userId, planId),
      );

      if (!plan) {
        throw new ApiError(404, "PLAN_NOT_FOUND", "Plan을 찾을 수 없습니다.", {
          planId,
        });
      }

      const materialIds = await unwrap(
        deps.planRepository.listSourceMaterialIds(plan.id),
      );

      await unwrap(deps.planRepository.deletePlan(plan.id));
      await unwrap(deps.planRepository.gcZombieMaterials(materialIds));

      return DeletePlanResponse.parse({ message: "Plan이 삭제되었습니다." });
    });
  };
}
