import { z } from "@hono/zod-openapi";

export const DocumentItemSchema = z.object({
  id: z.string().openapi({
    description: "문서 공개 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  fileName: z.string().openapi({
    description: "원본 파일 이름",
    example: "learning-guide.pdf",
  }),
  fileSize: z.number().int().openapi({
    description: "파일 크기(바이트)",
    example: 1048576,
  }),
  fileType: z.string().openapi({
    description: "파일 MIME 타입",
    example: "application/pdf",
  }),
  storageUrl: z.string().openapi({
    description: "파일에 접근할 수 있는 공개 URL",
    example: "https://pub-xxx.r2.dev/pdfs/user123/1234567890-uuid.pdf",
  }),
  learningPlanId: z.number().int().nullable().openapi({
    description: "연결된 LearningPlan ID(아직 연결 전이면 null)",
    example: 123,
  }),
  uploadedAt: z.string().openapi({
    description: "업로드 시각",
    example: "2024-01-01T00:00:00.000Z",
  }),
  createdAt: z.string().openapi({
    description: "생성 시각",
    example: "2024-01-01T00:00:00.000Z",
  }),
});

export const DocumentListResponseSchema = z.object({
  documents: z.array(DocumentItemSchema).openapi({
    description: "문서 목록",
  }),
  total: z.number().int().openapi({
    description: "총 문서 수",
    example: 5,
  }),
});

export const DocumentUploadResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "업로드 성공 여부",
    example: true,
  }),
  document: DocumentItemSchema.openapi({
    description: "업로드된 문서 정보",
  }),
});

export const DocumentDeleteResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "삭제 성공 여부",
    example: true,
  }),
  message: z.string().openapi({
    description: "성공 메시지",
    example: "문서를 삭제했습니다.",
  }),
});

export const DocumentErrorResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "요청 성공 여부",
    example: false,
  }),
  error: z.object({
    code: z.string().openapi({
      description: "에러 코드",
      example: "document:invalid_file_type",
    }),
    message: z.string().openapi({
      description: "에러 메시지",
      example: "PDF 파일만 업로드할 수 있습니다.",
    }),
  }),
});

export const DocumentSchemas = {
  DocumentItemSchema,
  DocumentListResponseSchema,
  DocumentUploadResponseSchema,
  DocumentDeleteResponseSchema,
  DocumentErrorResponseSchema,
};
