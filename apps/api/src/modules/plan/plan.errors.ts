import { createErrorThrower } from "../../lib/errors";

export const PlanErrors = {
  NOT_FOUND: {
    status: 404,
    code: "PLAN_NOT_FOUND",
    message: "Plan을 찾을 수 없습니다.",
  },
  CREATE_FAILED: {
    status: 500,
    code: "PLAN_CREATE_FAILED",
    message: "Plan 생성에 실패했습니다.",
  },
} as const;

export const throwPlanError = createErrorThrower(PlanErrors);
