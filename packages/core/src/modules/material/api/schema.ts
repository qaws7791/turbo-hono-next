import { z } from "zod";

import { PaginationInput, PaginationMeta } from "../../../common/pagination";

export const MaterialProcessingStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "READY",
  "FAILED",
]);
export type MaterialProcessingStatus = z.infer<
  typeof MaterialProcessingStatusSchema
>;

export const ListMaterialsInput = PaginationInput.extend({
  status: MaterialProcessingStatusSchema.optional(),
  search: z.string().max(200).optional(),
  sort: z.string().max(200).optional(),
});
export type ListMaterialsInput = z.infer<typeof ListMaterialsInput>;

export const MaterialListItem = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),

  mimeType: z.string().min(1).nullable(),
  fileSize: z.number().int().nonnegative().nullable(),
  processingStatus: MaterialProcessingStatusSchema,
  processingProgress: z.number().int().min(0).max(100).nullable(),
  processingStep: z.string().nullable(),
  processingError: z.string().nullable(),
  summary: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type MaterialListItem = z.infer<typeof MaterialListItem>;

export const ListMaterialsResponse = z.object({
  data: z.array(MaterialListItem),
  meta: PaginationMeta,
});
export type ListMaterialsResponse = z.infer<typeof ListMaterialsResponse>;

export const MaterialDetail = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),

  originalFilename: z.string().nullable(),
  mimeType: z.string().min(1).nullable(),
  fileSize: z.number().int().nonnegative().nullable(),
  processingStatus: MaterialProcessingStatusSchema,
  processingProgress: z.number().int().min(0).max(100).nullable(),
  processingStep: z.string().nullable(),
  processingError: z.string().nullable(),
  processedAt: z.string().datetime().nullable(),
  summary: z.string().nullable(),
  chunkCount: z.number().int().nonnegative().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type MaterialDetail = z.infer<typeof MaterialDetail>;

export const GetMaterialDetailResponse = z.object({
  data: MaterialDetail,
});
export type GetMaterialDetailResponse = z.infer<
  typeof GetMaterialDetailResponse
>;

export const CreateMaterialResult = z.union([
  z.object({
    mode: z.literal("sync"),
    materialId: z.string().uuid(),
    title: z.string().min(1),
    processingStatus: z.literal("READY"),
    summary: z.string().nullable(),
  }),
  z.object({
    mode: z.literal("async"),
    materialId: z.string().uuid(),
    jobId: z.string().uuid(),
    processingStatus: z.literal("PENDING"),
  }),
]);
export type CreateMaterialResult = z.infer<typeof CreateMaterialResult>;

export const InitiateMaterialUploadInput = z.object({
  originalFilename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(255),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(50 * 1024 * 1024),
});
export type InitiateMaterialUploadInput = z.infer<
  typeof InitiateMaterialUploadInput
>;

export const InitiateMaterialUploadResponse = z.object({
  data: z.object({
    uploadId: z.string().uuid(),
    objectKey: z.string().min(1),
    uploadUrl: z.string().url(),
    method: z.literal("PUT"),
    headers: z.record(z.string(), z.string()),
    expiresAt: z.string().datetime(),
  }),
});
export type InitiateMaterialUploadResponse = z.infer<
  typeof InitiateMaterialUploadResponse
>;

export const CompleteMaterialUploadInput = z.object({
  uploadId: z.string().uuid(),
  title: z.string().max(200).optional(),
  etag: z.string().min(1).optional(),
});
export type CompleteMaterialUploadInput = z.infer<
  typeof CompleteMaterialUploadInput
>;

export const UpdateMaterialTitleResponse = z.object({
  data: z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    updatedAt: z.string().datetime(),
  }),
});
export type UpdateMaterialTitleResponse = z.infer<
  typeof UpdateMaterialTitleResponse
>;

export const DeleteMaterialResponse = z.object({
  message: z.string().min(1),
  data: z.object({
    type: z.enum(["soft", "hard"]),
  }),
});
export type DeleteMaterialResponse = z.infer<typeof DeleteMaterialResponse>;

export const JobStatusSchema = z.enum([
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
]);
export type JobStatus = z.infer<typeof JobStatusSchema>;

export const JobStatusResponse = z.object({
  data: z.object({
    jobId: z.string().uuid(),
    status: JobStatusSchema,
    progress: z.number().min(0).max(1).nullable(),
    currentStep: z.string().nullable(),
    result: z
      .object({
        materialId: z.string().uuid(),
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
export type JobStatusResponse = z.infer<typeof JobStatusResponse>;
