import { createRoute, z } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "@repo/contracts/common";
import {
  CompleteMaterialUploadRequestSchema,
  CreateMaterialResponse201Schema,
  CreateMaterialResponse202Schema,
  DeleteMaterialResponseSchema,
  InitiateMaterialUploadRequestSchema,
  InitiateMaterialUploadResponseSchema,
  MaterialDetailResponseSchema,
  MaterialListResponseSchema,
  MaterialProcessingStatusSchema,
  PaginationQuerySchema,
  UpdateMaterialTitleRequestSchema,
  UpdateMaterialTitleResponseSchema,
} from "@repo/contracts/materials";

export const listMaterialsRoute = createRoute({
  tags: ["materials"],
  method: "get",
  path: "/api/materials",
  summary: "자료 목록 조회",
  description:
    "사용자의 학습 자료 목록을 페이지네이션과 함께 조회합니다.\n\n**필터링 옵션**: `status`, `search`, `sort`",
  request: {
    query: PaginationQuerySchema.extend({
      status: MaterialProcessingStatusSchema.optional(),
      search: z.string().optional(),
      sort: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "자료 목록을 반환합니다.",
      content: { "application/json": { schema: MaterialListResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const getMaterialDetailRoute = createRoute({
  tags: ["materials"],
  method: "get",
  path: "/api/materials/{materialId}",
  summary: "자료 상세 조회",
  description:
    "학습 자료의 상세 정보를 조회합니다. 추출된 개념, 원본 텍스트 등을 포함합니다.",
  request: {
    params: z.object({ materialId: z.uuid() }),
  },
  responses: {
    200: {
      description: "자료 상세를 반환합니다.",
      content: { "application/json": { schema: MaterialDetailResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const initiateMaterialUploadRoute = createRoute({
  tags: ["materials"],
  method: "post",
  path: "/api/materials/uploads/init",
  summary: "R2 업로드 세션 생성",
  description:
    "파일 업로드를 위한 Presigned URL을 발급합니다.\n\n**지원 형식**: PDF, DOCX, TXT 등",
  request: {
    body: {
      content: {
        "application/json": {
          schema: InitiateMaterialUploadRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "R2 presigned PUT URL을 반환합니다.",
      content: {
        "application/json": { schema: InitiateMaterialUploadResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const completeMaterialUploadRoute = createRoute({
  tags: ["materials"],
  method: "post",
  path: "/api/materials/uploads/complete",
  summary: "R2 업로드 완료 처리",
  description:
    "R2에 파일 업로드 완료 후 자료 분석을 시작합니다. 비동기 처리 시 `jobId`를 반환합니다.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CompleteMaterialUploadRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "동기 처리로 업로드/분석이 완료되었습니다.",
      content: {
        "application/json": { schema: CreateMaterialResponse201Schema },
      },
    },
    202: {
      description: "비동기 처리로 접수되었습니다.",
      content: {
        "application/json": { schema: CreateMaterialResponse202Schema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const completeMaterialUploadStreamRoute = createRoute({
  tags: ["materials"],
  method: "post",
  path: "/api/materials/uploads/complete/stream",
  summary: "R2 업로드 완료 처리 (SSE 스트림)",
  description:
    "SSE를 통해 업로드 완료 처리 진행 상황을 실시간으로 전달합니다.\\n\\n" +
    "**이벤트 타입**:\\n" +
    "- `progress`: 진행 상황 업데이트\\n" +
    "- `complete`: 처리 완료\\n" +
    "- `error`: 에러 발생",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CompleteMaterialUploadRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "SSE 스트림으로 진행 상황을 전달합니다.",
      content: { "text/event-stream": { schema: z.any() } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const deleteMaterialRoute = createRoute({
  tags: ["materials"],
  method: "delete",
  path: "/api/materials/{materialId}",
  summary: "자료 삭제",
  description: "학습 자료를 삭제합니다. 연관된 개념, 임베딩도 함께 삭제됩니다.",
  request: {
    params: z.object({ materialId: z.uuid() }),
  },
  responses: {
    200: {
      description: "soft/hard delete 결과를 반환합니다.",
      content: { "application/json": { schema: DeleteMaterialResponseSchema } },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const updateMaterialTitleRoute = createRoute({
  tags: ["materials"],
  method: "patch",
  path: "/api/materials/{materialId}",
  summary: "자료 제목 수정",
  description: "학습 자료의 제목을 수정합니다.",
  request: {
    params: z.object({ materialId: z.uuid() }),
    body: {
      content: {
        "application/json": {
          schema: UpdateMaterialTitleRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "자료 제목이 수정되었습니다.",
      content: {
        "application/json": { schema: UpdateMaterialTitleResponseSchema },
      },
    },
    default: {
      description: "에러 응답",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
  security: [{ cookieAuth: [] }],
});

export const materialRoutes = [
  listMaterialsRoute,
  getMaterialDetailRoute,
  initiateMaterialUploadRoute,
  completeMaterialUploadRoute,
  completeMaterialUploadStreamRoute,
  deleteMaterialRoute,
  updateMaterialTitleRoute,
] as const;
