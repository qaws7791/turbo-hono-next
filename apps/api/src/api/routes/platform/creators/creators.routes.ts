import { isCreator, isUser } from "@/api/middlewares/role.middleware";
import { CursorPaginationQueryDto, EntityIdParamDto } from "@/application/dtos/common.dto";
import {
  applyCreatorSchema,
  creatorProfileSchema,
  publicCreatorProfileSchema,
  updateMyCreatorProfileSchema,
} from "@/application/dtos/platform/creator.schemas";
import { StorySummaryResponseSchema } from "@/application/dtos/platform/story.dto";
import { createCursorPaginationResponseDto, createErrorResponseDto, createResponseDto } from "@/common/utils/dto";
import { createRoute, z } from "@hono/zod-openapi";
import status from "http-status";

const TAG = ["creators"];

export const applyCreator = createRoute({
  summary: "크리에이터 신청",
  method: "post",
  path: "/apply",
  tags: TAG,
  middleware: [isUser],
  request: {
    body: {
      content: {
        "application/json": {
          schema: applyCreatorSchema,
        },
      },
    },
  },
  responses: {
    [status.NO_CONTENT]: {
      description: "크리에이터 신청 성공",
    },
    [status.BAD_REQUEST]: {
      description: "크리에이터 신청 실패",
      content: {
        "application/json": {
          schema: createErrorResponseDto(),
        },
      },
    },
    [status.UNAUTHORIZED]: {
      description: "인증되지 않은 사용자",
      content: {
        "application/json": {
          schema: createErrorResponseDto(),
        },
      },
    },
  },
});

export const getMyCreatorProfile = createRoute({
  summary: "내 크리에이터 프로필 조회",
  method: "get",
  path: "/me",
  tags: TAG,
  middleware: [isUser] as const,
  responses: {
    [status.OK]: {
      description: "내 크리에이터 프로필 조회 성공",
      content: {
        "application/json": {
          schema: createResponseDto(creatorProfileSchema)
        },
      },
    },
    [status.UNAUTHORIZED]: {
      description: "인증되지 않은 사용자",
      content: {
        "application/json": {
          schema: createErrorResponseDto(),
        },
      },
    },
    [status.NOT_FOUND]: {
      description: "크리에이터 프로필이 없습니다.",
      content: {
        "application/json": {
          schema: createErrorResponseDto(),
        },
      },
    },
  },
});

export const updateMyCreatorProfile = createRoute({
  summary: "내 크리에이터 프로필 수정",
  method: "patch",
  path: "/me",
  tags: TAG,
  middleware: [isCreator] as const,
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateMyCreatorProfileSchema,
        },
      },
    },
  },
  responses: {
    [status.NO_CONTENT]: {
      description: "내 크리에이터 프로필 수정 성공",
    },
  },
});

export const getCreator = createRoute({
  summary: "크리에이터 조회",
  method: "get",
  path: "/{id}",
  tags: TAG,
  request: {
    params: EntityIdParamDto,
  },
  responses: {
    [status.OK]: {
      description: "크리에이터 조회 성공",
      content: {
        "application/json": {
          schema: createResponseDto(publicCreatorProfileSchema),
        },
      },
    },
    [status.NOT_FOUND]: {
      description: "크리에이터 프로필이 없습니다.",
      content: {
        "application/json": {
          schema: createErrorResponseDto(),
        },
      },
    },
  },
});

export const getCreatorStories = createRoute({
  summary: "크리에이터 스토리 조회",
  method: "get",
  path: "/{id}/stories",
  tags: TAG,
  request: {
    params:EntityIdParamDto,
    query: CursorPaginationQueryDto,
  },
  responses: {
    [status.OK]: {
      description: "크리에이터 스토리 조회 성공",
      content: {
        "application/json": {
          schema: createCursorPaginationResponseDto(z.array(StorySummaryResponseSchema)),
        },
      },
    },
  },
});

export const followCreator = createRoute({
  summary: "크리에이터 팔로우",
  method: "post",
  path: "/{id}/follow",
  tags: TAG,
  middleware: [isUser] as const,
  request: {
    params: EntityIdParamDto,
  },
  responses: {
    [status.NO_CONTENT]: {
      description: "크리에이터 팔로우 성공",
    },
  },
});

export const unfollowCreator = createRoute({
  summary: "크리에이터 언팔로우",
  method: "delete",
  path: "/{id}/follow",
  tags: TAG,
  middleware: [isUser] as const,
  request: {
    params: EntityIdParamDto,
  },
  responses: {
    [status.NO_CONTENT]: {
      description: "크리에이터 언팔로우 성공",
    },
  },
});
