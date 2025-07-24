import { createRoute } from "@hono/zod-openapi";
import {
  authMiddleware,
  requireRole,
} from "../../auth/middleware/auth.middleware";
import {
  CreateProjectRequestSchema,
  MyProjectQuerySchema,
  ProjectIdParamsSchema,
  ProjectListResponseSchema,
  ProjectQuerySchema,
  ProjectSchema,
  UpdateProjectRequestSchema,
} from "./projects.schema";

export const createProjectRoute = createRoute({
  method: "post",
  path: "/projects",
  tags: ["Projects"],
  summary: "프로젝트 생성",
  middleware: [authMiddleware, requireRole("creator")] as const,
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateProjectRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "프로젝트 생성 성공",
      content: {
        "application/json": {
          schema: ProjectSchema,
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
      description: "크리에이터 권한 필요",
    },
  },
});

export const getProjectsRoute = createRoute({
  method: "get",
  path: "/projects",
  tags: ["Projects"],
  summary: "프로젝트 목록 조회",
  request: {
    query: ProjectQuerySchema,
  },
  responses: {
    200: {
      description: "프로젝트 목록 조회 성공",
      content: {
        "application/json": {
          schema: ProjectListResponseSchema,
        },
      },
    },
  },
});

export const getProjectRoute = createRoute({
  method: "get",
  path: "/projects/{id}",
  tags: ["Projects"],
  summary: "프로젝트 상세 조회",
  request: {
    params: ProjectIdParamsSchema,
  },
  responses: {
    200: {
      description: "프로젝트 상세 조회 성공",
      content: {
        "application/json": {
          schema: ProjectSchema,
        },
      },
    },
    404: {
      description: "프로젝트를 찾을 수 없음",
    },
  },
});

export const updateProjectRoute = createRoute({
  method: "patch",
  path: "/projects/{id}",
  tags: ["Projects"],
  summary: "프로젝트 수정",
  middleware: [authMiddleware, requireRole("creator")] as const,
  request: {
    params: ProjectIdParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateProjectRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "프로젝트 수정 성공",
      content: {
        "application/json": {
          schema: ProjectSchema,
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
      description: "권한 없음",
    },
    404: {
      description: "프로젝트를 찾을 수 없음",
    },
  },
});

export const deleteProjectRoute = createRoute({
  method: "delete",
  path: "/projects/{id}",
  tags: ["Projects"],
  summary: "프로젝트 삭제",
  middleware: [authMiddleware, requireRole("creator")] as const,
  request: {
    params: ProjectIdParamsSchema,
  },
  responses: {
    204: {
      description: "프로젝트 삭제 성공",
    },
    401: {
      description: "인증 필요",
    },
    403: {
      description: "권한 없음",
    },
    404: {
      description: "프로젝트를 찾을 수 없음",
    },
  },
});

export const getMyProjectsRoute = createRoute({
  method: "get",
  path: "/my/projects",
  tags: ["My Data"],
  summary: "내 프로젝트 목록 조회",
  middleware: [authMiddleware, requireRole("creator")] as const,
  request: {
    query: MyProjectQuerySchema,
  },
  responses: {
    200: {
      description: "내 프로젝트 목록 조회 성공",
      content: {
        "application/json": {
          schema: ProjectListResponseSchema,
        },
      },
    },
    401: {
      description: "인증 필요",
    },
    403: {
      description: "크리에이터 권한 필요",
    },
  },
});
