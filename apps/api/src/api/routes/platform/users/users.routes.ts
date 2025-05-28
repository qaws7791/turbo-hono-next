import { isUser } from "@/api/middlewares/role.middleware";
import {
  MyUserResponseDto,
  UpdateUserProfileBodyDto,
} from "@/application/dtos/platform/user.dto";
import { createErrorResponseDto, createResponseDto } from "@/common/utils/dto";
import { createRoute } from "@hono/zod-openapi";
import status from "http-status";

const TAG = ["Users"];

export const getMyInfo = createRoute({
  summary: "내 정보 조회",
  method: "get",
  path: "/me",
  tags: TAG,
  middleware: [isUser] as const,
  responses: {
    [status.OK]: {
      description: "내 정보 조회 성공",
      content: {
        "application/json": {
          schema: createResponseDto(MyUserResponseDto),
        },
      },
    },
    [status.UNAUTHORIZED]: {
      description: "로그인이 필요합니다.",
      content: {
        "application/json": {
          schema: createErrorResponseDto(),
        },
      },
    },
  },
});


export const updateMyInfo = createRoute({
  summary: "내 정보 수정",
  method: "patch",
  path: "/me",
  tags: TAG,
  middleware: [isUser] as const,
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateUserProfileBodyDto,
        },
      },
    },
  },
  responses: {
    [status.NO_CONTENT]: {
      description: "내 정보 수정 성공",
    },
  },
});
