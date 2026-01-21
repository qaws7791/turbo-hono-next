import { createErrorThrower } from "../../lib/errors";

export const SessionErrors = {
  NOT_FOUND: {
    status: 404,
    code: "SESSION_NOT_FOUND",
    message: "세션을 찾을 수 없습니다.",
  },
} as const;

export const throwSessionError = createErrorThrower(SessionErrors);
