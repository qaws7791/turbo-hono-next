import { err, ok, safeTry } from "neverthrow";

import { coreError } from "../../../../common/core-error";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { ActivatePlanResponse } from "../../api";
import type { PlanRepository } from "../infrastructure/plan.repository";

export function activatePlan(deps: {
  readonly planRepository: PlanRepository;
}) {
  return function activatePlan(
    userId: string,
    planId: string,
  ): ResultAsync<ActivatePlanResponse, AppError> {
    return safeTry(async function* () {
      const now = new Date();

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

      yield* deps.planRepository.activatePlanTransaction({
        plan: { id: plan.id },
        userId,
        now,
      });

      return ok({ data: { id: plan.publicId, status: "ACTIVE" as const } });
    });
  };
}
