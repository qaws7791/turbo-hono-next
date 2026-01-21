import { err, ok, safeTry } from "neverthrow";

import { parseOrInternalError } from "../../../lib/zod";
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

      yield* deps.planRepository.activatePlanTransaction({
        plan: { id: plan.id },
        userId,
        now,
      });

      const response = yield* parseOrInternalError(
        ActivatePlanResponse,
        {
          data: { id: plan.publicId, status: "ACTIVE" as const },
        },
        "ActivatePlanResponse",
      );

      return ok(response);
    });
  };
}
