import { createErrorThrower } from "../../lib/errors";

export const MaterialErrors = {
  NOT_FOUND: {
    status: 404,
    code: "MATERIAL_NOT_FOUND",
    message: "자료를 찾을 수 없습니다.",
  },
  CREATE_FAILED: {
    status: 500,
    code: "MATERIAL_CREATE_FAILED",
    message: "자료 생성에 실패했습니다.",
  },
  EMBED_FAILED: {
    status: 500,
    code: "MATERIAL_EMBED_FAILED",
    message: "임베딩 처리 중 오류가 발생했습니다.",
  },
  JOB_NOT_FOUND: {
    status: 404,
    code: "JOB_NOT_FOUND",
    message: "작업을 찾을 수 없습니다.",
  },
} as const;

export const throwMaterialError = createErrorThrower(MaterialErrors);
