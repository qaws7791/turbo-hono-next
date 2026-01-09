import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { DeletePlanResponse } from "../plan.dto";
import { planRepository } from "../plan.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { DeletePlanResponse as DeletePlanResponseType } from "../plan.dto";

export async function deletePlan(
  userId: string,
  planId: string,
): Promise<Result<DeletePlanResponseType, AppError>> {
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

  // 2. 소스 Material ID 조회
  const materialIdsResult = await planRepository.listSourceMaterialIds(plan.id);
  if (materialIdsResult.isErr()) return err(materialIdsResult.error);
  const materialIds = materialIdsResult.value;

  // 3. Plan 삭제
  const deleteResult = await planRepository.deletePlan(plan.id);
  if (deleteResult.isErr()) return err(deleteResult.error);

  // 4. 좀비 Material 정리
  const gcResult = await planRepository.gcZombieMaterials(materialIds);
  if (gcResult.isErr()) return err(gcResult.error);

  return ok(DeletePlanResponse.parse({ message: "Plan이 삭제되었습니다." }));
}
