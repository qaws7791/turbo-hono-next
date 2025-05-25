import { isUser } from "@/api/middlewares/role.middleware";
import { ErrorResponseDto } from "@/application/dtos/common.dto";
import {
  MyUserResponseDto,
  UpdateUserProfileBodyDto,
} from "@/application/dtos/platform/user.dto";
import { createRoute } from "@hono/zod-openapi";
import status from "http-status";

const TAG = ["Users"];

/**
 * 내 정보 조회
 */
export const getMyInfo = createRoute({
  summary: "내 정보 조회",
  method: "get",
  path: "/me",
  tags: TAG,
  middleware: [isUser],
  responses: {
    [status.OK]: {
      description: "내 정보 조회 성공",
      content: {
        "application/json": {
          schema: MyUserResponseDto,
        },
      },
    },
    [status.UNAUTHORIZED]: {
      description: "로그인이 필요합니다.",
      content: {
        "application/json": {
          schema: ErrorResponseDto,
        },
      },
    },
  },
});

/**
 * 내 정보 수정
 */
export const updateMyInfo = createRoute({
  summary: "내 정보 수정",
  method: "patch",
  path: "/me",
  tags: TAG,
  middleware: [isUser],
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

export const deleteMyAccount = createRoute({
  summary: "내 계정 삭제",
  method: "delete",
  path: "/me",
  tags: TAG,
  middleware: [isUser],
  responses: {
    [status.NO_CONTENT]: {
      description: "내 계정 삭제 성공",
    },
  },
});
