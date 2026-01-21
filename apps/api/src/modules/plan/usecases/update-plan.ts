import { err, ok, safeTry } from "neverthrow";

import { parseOrInternalError } from "../../../lib/zod";
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
    return safeTry(async function* () {
      const plan = yield* deps.planRepository.findByPublicId(userId, planId);
      if (!plan) {
        return err(
          new ApiError(404, "PLAN_NOT_FOUND", "Plan을 찾을 수 없습니다.", {
            planId,
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

      const response = yield* parseOrInternalError(
        UpdatePlanResponse,
        {
          data: {
            id: updated.id,
            title: updated.title,
            icon: updated.icon,
            color: updated.color,
            status: updated.status,
          },
        },
        "UpdatePlanResponse",
      );

      return ok(response);
    });
  };
}
