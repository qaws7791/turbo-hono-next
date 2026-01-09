import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { PlanStatusSchema, UpdatePlanStatusResponse } from "../plan.dto";
import { planRepository } from "../plan.repository";
import { validateStatusTransition } from "../plan.utils";

import { activatePlan } from "./activate-plan";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  PlanStatus,
  UpdatePlanStatusResponse as UpdatePlanStatusResponseType,
} from "../plan.dto";

export async function updatePlanStatus(
  userId: string,
  planId: string,
  nextStatus: PlanStatus,
): Promise<Result<UpdatePlanStatusResponseType, AppError>> {
  const now = new Date();

  // 1. 입력 검증
  const parseResult = PlanStatusSchema.safeParse(nextStatus);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validatedStatus = parseResult.data;

  // 2. Plan 조회
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

  // 3. ACTIVE 상태로의 전환은 activatePlan 사용
  if (validatedStatus === "ACTIVE") {
    return activatePlan(userId, planId);
  }

  // 4. 상태 전이 검증
  if (!validateStatusTransition(plan.status, validatedStatus)) {
    return err(
      new ApiError(400, "INVALID_REQUEST", "허용되지 않는 상태 전이입니다.", {
        from: plan.status,
        to: validatedStatus,
      }),
    );
  }

  // 5. 소스 Material ID 조회
  const materialIdsResult = await planRepository.listSourceMaterialIds(plan.id);
  if (materialIdsResult.isErr()) return err(materialIdsResult.error);
  const materialIds = materialIdsResult.value;

  // 6. Plan 상태 업데이트 트랜잭션
  const updateResult = await planRepository.updatePlanStatusTransaction({
    planId: plan.id,
    status: validatedStatus,
    now,
  });
  if (updateResult.isErr()) return err(updateResult.error);

  // 7. ARCHIVED 상태인 경우 좀비 Material 정리
  if (validatedStatus === "ARCHIVED") {
    const gcResult = await planRepository.gcZombieMaterials(materialIds);
    if (gcResult.isErr()) return err(gcResult.error);
  }

  return ok(
    UpdatePlanStatusResponse.parse({
      data: { id: plan.publicId, status: validatedStatus },
    }),
  );
}
