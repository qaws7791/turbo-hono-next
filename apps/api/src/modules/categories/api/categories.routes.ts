import { createRoute } from "@hono/zod-openapi";
import {
  authMiddleware,
  requireRole,
} from "../../auth/middleware/auth.middleware";
import {
  CategoryAlreadyExistsErrorSchema,
  CategoryIdParamsSchema,
  CategoryListResponseSchema,
  CategoryResponseSchema,
  CategorySlugParamsSchema,
  CreateCategoryRequestSchema,
  UpdateCategoryRequestSchema,
} from "./categories.schema";

export const createCategoryRoute = createRoute({
  method: "post",
  path: "/categories",
  tags: ["Categories"],
  summary: "카테고리 생성",
  middleware: [authMiddleware, requireRole("admin")] as const,
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateCategoryRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "카테고리 생성 성공",
      content: {
        "application/json": {
          schema: CategoryResponseSchema,
        },
      },
    },
    400: {
      description: "잘못된 요청",
    },
    401: {
      description: "인증 필요",
    },
    403: {
      description: "관리자 권한 필요",
    },
    409: {
      description: "카테고리가 이미 존재함",
      content: {
        "application/json": {
          schema: CategoryAlreadyExistsErrorSchema,
        },
      },
    },
  },
});

export const getCategoriesRoute = createRoute({
  method: "get",
  path: "/categories",
  tags: ["Categories"],
  summary: "카테고리 목록 조회",
  responses: {
    200: {
      description: "카테고리 목록 조회 성공",
      content: {
        "application/json": {
          schema: CategoryListResponseSchema,
        },
      },
    },
  },
});

export const getCategoryRoute = createRoute({
  method: "get",
  path: "/categories/{id}",
  tags: ["Categories"],
  summary: "카테고리 상세 조회 (ID)",
  request: {
    params: CategoryIdParamsSchema,
  },
  responses: {
    200: {
      description: "카테고리 상세 조회 성공",
      content: {
        "application/json": {
          schema: CategoryResponseSchema,
        },
      },
    },
    404: {
      description: "카테고리를 찾을 수 없음",
    },
  },
});

export const getCategoryBySlugRoute = createRoute({
  method: "get",
  path: "/categories/slug/{slug}",
  tags: ["Categories"],
  summary: "카테고리 상세 조회 (Slug)",
  request: {
    params: CategorySlugParamsSchema,
  },
  responses: {
    200: {
      description: "카테고리 상세 조회 성공",
      content: {
        "application/json": {
          schema: CategoryResponseSchema,
        },
      },
    },
    404: {
      description: "카테고리를 찾을 수 없음",
    },
  },
});

export const updateCategoryRoute = createRoute({
  method: "patch",
  path: "/categories/{id}",
  tags: ["Categories"],
  summary: "카테고리 수정",
  middleware: [authMiddleware, requireRole("admin")] as const,
  request: {
    params: CategoryIdParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateCategoryRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "카테고리 수정 성공",
      content: {
        "application/json": {
          schema: CategoryResponseSchema,
        },
      },
    },
    400: {
      description: "잘못된 요청",
    },
    401: {
      description: "인증 필요",
    },
    403: {
      description: "관리자 권한 필요",
    },
    404: {
      description: "카테고리를 찾을 수 없음",
    },
    409: {
      description: "슬러그가 이미 존재함",
    },
  },
});

export const deleteCategoryRoute = createRoute({
  method: "delete",
  path: "/categories/{id}",
  tags: ["Categories"],
  summary: "카테고리 삭제",
  middleware: [authMiddleware, requireRole("admin")] as const,
  request: {
    params: CategoryIdParamsSchema,
  },
  responses: {
    204: {
      description: "카테고리 삭제 성공",
    },
    401: {
      description: "인증 필요",
    },
    403: {
      description: "관리자 권한 필요",
    },
    404: {
      description: "카테고리를 찾을 수 없음",
    },
  },
});
