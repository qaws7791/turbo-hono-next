import { tryPromise, unwrap } from "../../../lib/result";
import { ApiError } from "../../../middleware/error-handler";
import { ActivatePlanResponse } from "../plan.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { ActivatePlanResponse as ActivatePlanResponseType } from "../plan.dto";
import type { PlanRepository } from "../plan.repository";

export function activatePlan(deps: {
  readonly planRepository: PlanRepository;
}) {
  return function activatePlan(
    userId: string,
    planId: string,
  ): ResultAsync<ActivatePlanResponseType, AppError> {
    return tryPromise(async () => {
      const now = new Date();

      const plan = await unwrap(
        deps.planRepository.findByPublicId(userId, planId),
      );
      if (!plan) {
        throw new ApiError(404, "PLAN_NOT_FOUND", "Plan을 찾을 수 없습니다.", {
          planId,
        });
      }

      await unwrap(
        deps.planRepository.activatePlanTransaction({
          plan: { id: plan.id },
          userId,
          now,
        }),
      );

      return ActivatePlanResponse.parse({
        data: { id: plan.publicId, status: "ACTIVE" as const },
      });
    });
  };
}
