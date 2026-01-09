import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { ActivatePlanResponse } from "../plan.dto";
import { planRepository } from "../plan.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { ActivatePlanResponse as ActivatePlanResponseType } from "../plan.dto";

export async function activatePlan(
  userId: string,
  planId: string,
): Promise<Result<ActivatePlanResponseType, AppError>> {
  const now = new Date();

  // 1. Plan 조회
  const planResult = await planRepository.findByPublicId(userId, planId);
  if (planResult.isErr()) return err(planResult.error);
  const plan = planResult.value;

  if (!plan) {
    return err(
      new ApiError(404, "PLAN_NOT_FOUND", "Plan을 찾을 수 없습니다.", {
        planId,
      }),
    );
  }

  // 2. Plan 활성화 트랜잭션 실행
  const activateResult = await planRepository.activatePlanTransaction({
    plan: { id: plan.id },
    userId,
    now,
  });
  if (activateResult.isErr()) return err(activateResult.error);

  return ok(
    ActivatePlanResponse.parse({
      data: { id: plan.publicId, status: "ACTIVE" as const },
    }),
  );
}
