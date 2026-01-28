import { err, ok, safeTry } from "neverthrow";

import { coreError } from "../../../../common/core-error";
import { validateStatusTransition } from "../domain/plan.types";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { PlanStatus, UpdatePlanStatusResponse } from "../../api";
import type { PlanRepository } from "../infrastructure/plan.repository";

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
  ): ResultAsync<UpdatePlanStatusResponse, AppError> {
    if (nextStatus === "ACTIVE") {
      return deps.activatePlan(userId, planId);
    }

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

      if (!validateStatusTransition(plan.status, nextStatus)) {
        return err(
          coreError({
            code: "INVALID_REQUEST",
            message: "허용되지 않는 상태 전이입니다.",
            details: { from: plan.status, to: nextStatus },
          }),
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

      return ok({ data: { id: plan.publicId, status: nextStatus } });
    });
  };
}
