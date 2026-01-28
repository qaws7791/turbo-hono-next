import { err, ok, safeTry } from "neverthrow";

import { coreError } from "../../../../common/core-error";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { UpdatePlanInput, UpdatePlanResponse } from "../../api";
import type { PlanRepository } from "../infrastructure/plan.repository";

export function updatePlan(deps: { readonly planRepository: PlanRepository }) {
  return function updatePlan(
    userId: string,
    planId: string,
    input: UpdatePlanInput,
  ): ResultAsync<UpdatePlanResponse, AppError> {
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

      const now = new Date();
      const updateData = {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.icon !== undefined ? { icon: input.icon } : {}),
        ...(input.color !== undefined ? { color: input.color } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      } satisfies {
        title?: string;
        icon?: string;
        color?: string;
        status?: typeof input.status;
      };

      const updated = yield* deps.planRepository.updatePlan(
        plan.id,
        updateData,
        now,
      );

      return ok({
        data: {
          id: updated.id,
          title: updated.title,
          icon: updated.icon,
          color: updated.color,
          status: updated.status,
        },
      });
    });
  };
}
