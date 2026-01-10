import { z } from "@hono/zod-openapi";

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export const MaterialProcessingStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "READY",
  "FAILED",
]);

export const MaterialSourceTypeSchema = z.enum(["FILE", "TEXT"]);

export const MaterialListItemSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1),
  sourceType: MaterialSourceTypeSchema,
  mimeType: z.string().min(1).nullable(),
  fileSize: z.number().int().nonnegative().nullable(),
  processingStatus: MaterialProcessingStatusSchema,
  summary: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const PaginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

export const MaterialListResponseSchema = z.object({
  data: z.array(MaterialListItemSchema),
  meta: PaginationMetaSchema,
});

export const MaterialDetailSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1),
  sourceType: MaterialSourceTypeSchema,
  originalFilename: z.string().nullable(),
  mimeType: z.string().min(1).nullable(),
  fileSize: z.number().int().nonnegative().nullable(),
  processingStatus: MaterialProcessingStatusSchema,
  processedAt: z.iso.datetime().nullable(),
  summary: z.string().nullable(),
  chunkCount: z.number().int().nonnegative().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const MaterialDetailResponseSchema = z.object({
  data: MaterialDetailSchema,
});

export const CreateMaterialResponse201Schema = z.object({
  data: z.object({
    id: z.uuid(),
    title: z.string().min(1),
    processingStatus: MaterialProcessingStatusSchema,
    summary: z.string().nullable().optional(),
  }),
});

export const CreateMaterialResponse202Schema = z.object({
  data: z.object({
    id: z.uuid(),
    jobId: z.uuid(),
    processingStatus: MaterialProcessingStatusSchema,
  }),
});

export const InitiateMaterialUploadRequestSchema = z.object({
  originalFilename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(255),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(50 * 1024 * 1024),
});

export const InitiateMaterialUploadResponseSchema = z.object({
  data: z.object({
    uploadId: z.uuid(),
    objectKey: z.string().min(1),
    uploadUrl: z.url(),
    method: z.literal("PUT"),
    headers: z.record(z.string(), z.string()),
    expiresAt: z.iso.datetime(),
  }),
});

export const CompleteMaterialUploadRequestSchema = z.object({
  uploadId: z.uuid(),
  title: z.string().max(200).optional(),
  etag: z.string().min(1).optional(),
});

export const UpdateMaterialTitleRequestSchema = z.object({
  title: z.string().min(1).max(200),
});

export const UpdateMaterialTitleResponseSchema = z.object({
  data: z.object({
    id: z.uuid(),
    title: z.string().min(1),
    updatedAt: z.iso.datetime(),
  }),
});

export const DeleteMaterialResponseSchema = z.object({
  message: z.string().min(1),
  data: z.object({
    type: z.enum(["soft", "hard"]),
  }),
});

export const JobStatusSchema = z.enum([
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
]);

export const JobStatusResponseSchema = z.object({
  data: z.object({
    jobId: z.uuid(),
    status: JobStatusSchema,
    progress: z.number().min(0).max(1).nullable(),
    currentStep: z.string().nullable(),
    result: z
      .object({
        materialId: z.uuid(),
        summary: z.string().nullable(),
      })
      .nullable(),
    error: z
      .object({
        code: z.string().min(1),
        message: z.string().min(1),
      })
      .nullable(),
  }),
});

// SSE 진행 상황 이벤트 스키마
export const UploadProgressStepSchema = z.enum([
  "PREPARING", // 업로드 준비 중
  "VERIFYING", // 파일 확인 중
  "LOADING", // 파일 불러오는 중
  "CHECKING", // 기존 자료와 비교 중
  "STORING", // 파일 저장 중
  "ANALYZING", // 학습 자료 분석 중
  "FINALIZING", // 마무리 중
  "COMPLETED", // 완료
  "FAILED", // 실패
]);

export const UploadProgressEventSchema = z.object({
  step: UploadProgressStepSchema,
  progress: z.number().min(0).max(100),
  message: z.string(), // 사용자에게 표시될 메시지
});

export const UploadCompleteEventSchema = z.object({
  data: z.object({
    id: z.uuid(),
    title: z.string().min(1),
    processingStatus: MaterialProcessingStatusSchema,
    summary: z.string().nullable().optional(),
  }),
});

export const UploadErrorEventSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
});
