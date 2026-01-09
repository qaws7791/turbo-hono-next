import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { UpdatePlanInput, UpdatePlanResponse } from "../plan.dto";
import { planRepository } from "../plan.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  UpdatePlanInput as UpdatePlanInputType,
  UpdatePlanResponse as UpdatePlanResponseType,
} from "../plan.dto";

export async function updatePlan(
  userId: string,
  planId: string,
  input: UpdatePlanInputType,
): Promise<Result<UpdatePlanResponseType, AppError>> {
  // 1. 입력 검증
  const parseResult = UpdatePlanInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

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

  // 3. Plan 업데이트
  const now = new Date();
  const updateData: {
    title?: string;
    icon?: string;
    color?: string;
    status?: typeof validated.status;
  } = {};

  if (validated.title !== undefined) updateData.title = validated.title;
  if (validated.icon !== undefined) updateData.icon = validated.icon;
  if (validated.color !== undefined) updateData.color = validated.color;
  if (validated.status !== undefined) updateData.status = validated.status;

  const updateResult = await planRepository.updatePlan(
    plan.id,
    updateData,
    now,
  );
  if (updateResult.isErr()) return err(updateResult.error);
  const updated = updateResult.value;

  return ok(
    UpdatePlanResponse.parse({
      data: {
        id: updated.id,
        title: updated.title,
        icon: updated.icon,
        color: updated.color,
        status: updated.status,
      },
    }),
  );
}
