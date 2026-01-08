import { createRoute, z } from "@hono/zod-openapi";

import { ErrorResponseSchema, PublicIdSchema } from "../../common/schema";

import {
  ConceptDetailResponseSchema,
  ConceptLibraryListResponseSchema,
  ConceptListResponseSchema,
  ConceptReviewStatusSchema,
  ConceptSearchResponseSchema,
  CreateConceptReviewRequestSchema,
  CreateConceptReviewResponseSchema,
} from "./schema";

export const listConceptLibraryRoute = createRoute({
  tags: ["concepts"],
  method: "get",
  path: "/api/concepts",
  summary: "Concept 전체 목록 조회",
  description:
    "현재 사용자의 모든 학습 공간에 걸친 개념 목록을 조회합니다.\n\n**필터링**: `search`, `reviewStatus`, `spaceIds`",
  request: {
    query: z.object({
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
      search: z.string().optional(),
      reviewStatus: ConceptReviewStatusSchema.optional(),
      spaceIds: z.array(PublicIdSchema).optional(),
    }),
  },
  responses: {
    200: {
      description: "Concept 목록을 반환합니다.",
      content: {
        "application/json": { schema: ConceptLibraryListResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const listConceptsRoute = createRoute({
  tags: ["concepts"],
  method: "get",
  path: "/api/spaces/{spaceId}/concepts",
  summary: "Concept 목록 조회",
  description:
    "학습 공간에서 추출된 개념 목록을 조회합니다.\n\n**필터링**: `search`, `reviewStatus`",
  request: {
    params: z.object({ spaceId: PublicIdSchema }),
    query: z.object({
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
      search: z.string().optional(),
      reviewStatus: ConceptReviewStatusSchema.optional(),
    }),
  },
  responses: {
    200: {
      description: "Concept 목록을 반환합니다.",
      content: { "application/json": { schema: ConceptListResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const getConceptDetailRoute = createRoute({
  tags: ["concepts"],
  method: "get",
  path: "/api/concepts/{conceptId}",
  summary: "Concept 상세 조회",
  description:
    "개념의 상세 정보를 조회합니다. 설명, 관련 자료, 복습 기록을 포함합니다.",
  request: {
    params: z.object({ conceptId: PublicIdSchema }),
  },
  responses: {
    200: {
      description: "Concept 상세를 반환합니다.",
      content: { "application/json": { schema: ConceptDetailResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const createConceptReviewRoute = createRoute({
  tags: ["concepts"],
  method: "post",
  path: "/api/concepts/{conceptId}/reviews",
  summary: "복습 기록",
  description:
    "개념 복습 결과를 기록합니다. SM-2 알고리즘 기반으로 다음 복습 일정을 계산합니다.",
  request: {
    params: z.object({ conceptId: PublicIdSchema }),
    body: {
      content: {
        "application/json": { schema: CreateConceptReviewRequestSchema },
      },
    },
  },
  responses: {
    201: {
      description: "복습 기록이 저장되었습니다.",
      content: {
        "application/json": { schema: CreateConceptReviewResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const searchConceptsRoute = createRoute({
  tags: ["concepts"],
  method: "get",
  path: "/api/concepts/search",
  summary: "전체 Space Concept 검색",
  description:
    "여러 학습 공간에 걸쳐 개념을 검색합니다. 벡터 유사도 기반 검색을 지원합니다.",
  request: {
    query: z.object({
      q: z.string().min(1),
      spaceIds: z.array(PublicIdSchema).optional(),
    }),
  },
  responses: {
    200: {
      description: "검색 결과를 반환합니다.",
      content: { "application/json": { schema: ConceptSearchResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const conceptRoutes = [
  listConceptLibraryRoute,
  listConceptsRoute,
  getConceptDetailRoute,
  createConceptReviewRoute,
  searchConceptsRoute,
] as const;
