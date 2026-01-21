import { createErrorThrower } from "../../lib/errors";

export const AuthErrors = {
  INVALID_REDIRECT: {
    status: 400,
    code: "INVALID_REDIRECT",
    message: "redirectPath가 허용되지 않습니다.",
  },
} as const;

export const throwAuthError = createErrorThrower(AuthErrors);
