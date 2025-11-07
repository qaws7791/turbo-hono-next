import { createRoute, z } from "@hono/zod-openapi";

import {
  DocumentItemSchema,
  DocumentSchemas,
  DocumentUploadResponseSchema,
} from "./schema";

export const documentDetailRoute = createRoute({
  tags: ["documents"],
  method: "get",
  path: "/documents/{publicId}",
  summary: "문서 상세 정보를 조회합니다",
  description: `문서 공개 ID를 통해 저장된 DocumentItem을 확인합니다.

- **인증 필요**: cookieAuth 세션이 없으면 401을 반환합니다. 자료 외부 유출을
  막기 위한 기본 조건입니다.
- **접근 제어**: 문서 소유자가 아니면 403을 반환합니다. 이는 개인화된
  학습 기록을 보호하기 위함입니다.
- **처리 상태**: 텍스트 추출이 진행 중인 경우 일부 필드가 비어 있을 수
  있습니다.`,
  request: {
    params: z.object({
      publicId: z.string().openapi({
        description: "문서 공개 ID",
        examples: ["550e8400-e29b-41d4-a716-446655440000"],
      }),
    }),
  },
  responses: {
    200: {
      description: "문서를 불러왔습니다.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            document: DocumentItemSchema,
          }),
        },
      },
    },
    default: {
      description: "에러 응답",
      content: {
        "application/json": {
          schema: DocumentSchemas.ErrorResponseSchema,
        },
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
});

export const documentUploadRoute = createRoute({
  tags: ["documents"],
  method: "post",
  path: "/documents/upload",
  summary: "PDF 학습 자료를 업로드합니다",
  description: `PDF 파일을 업로드하고 비동기 텍스트 추출을 시작합니다.

- **파일 제한**: 10MB 이하의 PDF만 허용합니다. R2 스토리지 사용량과
  처리 시간을 제어하기 위한 정책입니다.
- **비동기 처리**: 응답은 업로드 결과만 반환하고 텍스트 추출은 백그라운드에서
  수행됩니다.
- **보안 주의**: 민감 정보가 포함된 파일은 암호화 저장되며, 업로드 후에도
  접근 권한 검사가 적용됩니다.`,
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              file: {
                type: "string",
                format: "binary",
                description:
                  "업로드할 PDF 파일 (field: file, 10MB 이하, application/pdf)",
              },
            },
            required: ["file"],
          },
          encoding: {
            file: {
              contentType: "application/pdf",
            },
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "문서를 업로드했습니다.",
      content: {
        "application/json": {
          schema: DocumentUploadResponseSchema,
        },
      },
    },
    default: {
      description: "에러 응답",
      content: {
        "application/json": {
          schema: DocumentSchemas.ErrorResponseSchema,
        },
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
});

export const documentRoutes = [
  documentDetailRoute,
  documentUploadRoute,
] as const;
