import { createErrorThrower } from "../../lib/errors";

export const SpaceErrors = {
  NOT_FOUND: {
    status: 404,
    code: "SPACE_NOT_FOUND",
    message: "Space를 찾을 수 없습니다.",
  },
  ACCESS_DENIED: {
    status: 403,
    code: "SPACE_ACCESS_DENIED",
    message: "이 Space에 접근할 수 없습니다.",
  },
  CREATE_FAILED: {
    status: 500,
    code: "SPACE_CREATE_FAILED",
    message: "Space 생성에 실패했습니다.",
  },
} as const;

export const throwSpaceError = createErrorThrower(SpaceErrors);
