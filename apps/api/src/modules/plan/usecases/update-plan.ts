import { tryPromise, unwrap } from "../../../lib/result";
import { ApiError } from "../../../middleware/error-handler";
import { UpdatePlanResponse } from "../plan.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  UpdatePlanInput as UpdatePlanInputType,
  UpdatePlanResponse as UpdatePlanResponseType,
} from "../plan.dto";
import type { PlanRepository } from "../plan.repository";

export function updatePlan(deps: { readonly planRepository: PlanRepository }) {
  return function updatePlan(
    userId: string,
    planId: string,
    input: UpdatePlanInputType,
  ): ResultAsync<UpdatePlanResponseType, AppError> {
    return tryPromise(async () => {
      const plan = await unwrap(
        deps.planRepository.findByPublicId(userId, planId),
      );

      if (!plan) {
        throw new ApiError(404, "PLAN_NOT_FOUND", "Plan을 찾을 수 없습니다.", {
          planId,
        });
      }

      const now = new Date();
      const updateData: {
        title?: string;
        icon?: string;
        color?: string;
        status?: typeof input.status;
      } = {};

      if (input.title !== undefined) updateData.title = input.title;
      if (input.icon !== undefined) updateData.icon = input.icon;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.status !== undefined) updateData.status = input.status;

      const updated = await unwrap(
        deps.planRepository.updatePlan(plan.id, updateData, now),
      );

      return UpdatePlanResponse.parse({
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
