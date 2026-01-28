import { err, ok, safeTry } from "neverthrow";

import { coreError } from "../../../../common/core-error";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { DeletePlanResponse } from "../../api";
import type { PlanRepository } from "../infrastructure/plan.repository";

export function deletePlan(deps: { readonly planRepository: PlanRepository }) {
  return function deletePlan(
    userId: string,
    planId: string,
  ): ResultAsync<DeletePlanResponse, AppError> {
    return safeTry(async function* () {
      const plan = yield* deps.planRepository.findByPublicId(userId, planId);
      if (!plan) {
        return err(
          coreError({
            code: "PLAN_NOT_FOUND",
            message: "Plan을 찾을 수 없습니다.",
            details: { planId },
          }),
        );
      }

      const materialIds = yield* deps.planRepository.listSourceMaterialIds(
        plan.id,
      );

      yield* deps.planRepository.deletePlan(plan.id);
      yield* deps.planRepository.gcZombieMaterials(materialIds);

      return ok({ message: "Plan이 삭제되었습니다." });
    });
  };
}
