import { createRoute, z } from "@hono/zod-openapi";

import { ErrorResponseSchema, PublicIdSchema } from "../../common/schema";

import {
  CreateSpaceRequestSchema,
  CreateSpaceResponseSchema,
  DeleteSpaceResponseSchema,
  GetSpaceResponseSchema,
  SpaceListResponseSchema,
  UpdateSpaceRequestSchema,
  UpdateSpaceResponseSchema,
} from "./schema";

export const listSpacesRoute = createRoute({
  tags: ["spaces"],
  method: "get",
  path: "/api/spaces",
  summary: "Space 목록 조회",
  description: "현재 사용자가 소유한 모든 학습 공간 목록을 조회합니다.",
  request: {
    query: z.object({
      include: z
        .enum(["activePlan", "lastStudiedAt"])
        .array()
        .optional()
        .describe(
          "포함할 추가 정보. 'activePlan'은 활성 플랜 정보를, 'lastStudiedAt'는 마지막 학습 날짜를 포함합니다.",
        ),
    }),
  },
  responses: {
    200: {
      description: "Space 목록을 반환합니다.",
      content: { "application/json": { schema: SpaceListResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const createSpaceRoute = createRoute({
  tags: ["spaces"],
  method: "post",
  path: "/api/spaces",
  summary: "Space 생성",
  description:
    "새로운 학습 공간을 생성합니다. 주제별로 자료와 학습 계획을 관리할 수 있습니다.",
  request: {
    body: {
      content: { "application/json": { schema: CreateSpaceRequestSchema } },
    },
  },
  responses: {
    201: {
      description: "Space가 생성되었습니다.",
      content: { "application/json": { schema: CreateSpaceResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const getSpaceRoute = createRoute({
  tags: ["spaces"],
  method: "get",
  path: "/api/spaces/{spaceId}",
  summary: "Space 상세 조회",
  description: "학습 공간의 상세 정보를 조회합니다.",
  request: {
    params: z.object({ spaceId: PublicIdSchema }),
  },
  responses: {
    200: {
      description: "Space 상세를 반환합니다.",
      content: { "application/json": { schema: GetSpaceResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const updateSpaceRoute = createRoute({
  tags: ["spaces"],
  method: "patch",
  path: "/api/spaces/{spaceId}",
  summary: "Space 수정",
  description: "학습 공간의 이름, 설명 등을 수정합니다.",
  request: {
    params: z.object({ spaceId: PublicIdSchema }),
    body: {
      content: { "application/json": { schema: UpdateSpaceRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "Space가 수정되었습니다.",
      content: { "application/json": { schema: UpdateSpaceResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const deleteSpaceRoute = createRoute({
  tags: ["spaces"],
  method: "delete",
  path: "/api/spaces/{spaceId}",
  summary: "Space 삭제",
  description:
    "학습 공간을 삭제합니다. 포함된 모든 자료와 학습 계획도 함께 삭제됩니다.",
  request: {
    params: z.object({ spaceId: PublicIdSchema }),
  },
  responses: {
    200: {
      description: "Space가 삭제되었습니다.",
      content: { "application/json": { schema: DeleteSpaceResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const spaceRoutes = [
  listSpacesRoute,
  createSpaceRoute,
  getSpaceRoute,
  updateSpaceRoute,
  deleteSpaceRoute,
] as const;
