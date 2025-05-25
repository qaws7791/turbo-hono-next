import { isUser } from "@/api/middlewares/role.middleware";
import {
  applyCreatorSchema,
  updateMyCreatorProfileSchema,
} from "@/api/routes/platform/creators/creators.schemas";
import { storyBaseSchema } from "@/api/routes/platform/stories/stories.routes";
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
    [status.CREATED]: {
      description: "크리에이터 신청 성공",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    [status.BAD_REQUEST]: {
      description: "크리에이터 신청 실패",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    [status.UNAUTHORIZED]: {
      description: "인증되지 않은 사용자",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
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
  responses: {
    [status.OK]: {
      description: "내 크리에이터 프로필 조회 성공",
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            brandName: z.string(),
            introduction: z.string(),
            businessNumber: z.string(),
            businessName: z.string(),
            ownerName: z.string(),
            sidoId: z.number(),
            sigunguId: z.number(),
            categoryId: z.number(),
            contactInfo: z.string(),
            applicationStatus: z.string(),
            approvedAt: z.string().datetime().nullable(),
            rejectedAt: z.string().datetime().nullable(),
            rejectionReason: z.string().nullable(),
            createdAt: z.string().datetime(),
            updatedAt: z.string().datetime(),
          }),
        },
      },
    },
    [status.UNAUTHORIZED]: {
      description: "인증되지 않은 사용자",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    [status.NOT_FOUND]: {
      description: "크리에이터 프로필이 없습니다.",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
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
  path: "/:id",
  tags: TAG,
  request: {
    params: z.object({
      id: z.number(),
    }),
  },
  responses: {
    [status.OK]: {
      description: "크리에이터 조회 성공",
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            brandName: z.string(),
            introduction: z.string(),
            businessNumber: z.string(),
            businessName: z.string(),
            ownerName: z.string(),
            regionId: z.number(),
            contactInfo: z.string(),
          }),
        },
      },
    },
  },
});

export const getCreatorStories = createRoute({
  summary: "크리에이터 스토리 조회",
  method: "get",
  path: "/:id/stories",
  tags: TAG,
  request: {
    params: z.object({
      id: z.number(),
    }),
    query: z.object({
      limit: z.number().optional(),
      cursor: z.string().optional(),
    }),
  },
  responses: {
    [status.OK]: {
      description: "크리에이터 스토리 조회 성공",
      content: {
        "application/json": {
          schema: z.object({
            stories: z.array(storyBaseSchema),
            nextCursor: z.string().nullable(),
          }),
        },
      },
    },
  },
});

export const followCreator = createRoute({
  summary: "크리에이터 팔로우",
  method: "post",
  path: "/:id/follow",
  tags: TAG,
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
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
  path: "/:id/follow",
  tags: TAG,
  request: {
    params: z.object({
      id: z.coerce.number(),
    }),
  },
  responses: {
    [status.NO_CONTENT]: {
      description: "크리에이터 언팔로우 성공",
    },
  },
});
