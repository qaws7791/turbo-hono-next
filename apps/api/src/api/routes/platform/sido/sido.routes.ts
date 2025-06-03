import { EntityIdParamDto } from "@/application/dtos/common.dto";
import { SidoListResponseDto, SigunguListResponseDto } from "@/application/dtos/platform/sido.dto";
import { createResponseDto } from "@/common/utils/dto";
import { createRoute } from "@hono/zod-openapi";
import status from "http-status";

const TAG = ["sido"];

export const getSidoList = createRoute({
  summary: "시도 목록 조회",
  method: "get",
  path: "/",
  tags: TAG,
  responses: {
    [status.OK]: {
      description: "시도 목록 조회 성공",
      content: {
        "application/json": {
          schema: createResponseDto(SidoListResponseDto),
        },
      },
    },
  },
});

export const getSigunguList = createRoute({
  summary: "시군구 목록 조회",
  method: "get",
  path: "/{id}/sigungu",
  tags: TAG,
  request: {
    params: EntityIdParamDto,
  },
  responses: {
    [status.OK]: {
      description: "시군구 목록 조회 성공",
      content: {
        "application/json": {
          schema: createResponseDto(SigunguListResponseDto),
        },
      },
    },
    [status.BAD_REQUEST]: {
      description: "시도 ID가 유효하지 않습니다.",
    },
  },
});
