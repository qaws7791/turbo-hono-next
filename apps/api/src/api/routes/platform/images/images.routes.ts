import { createRoute, z } from "@hono/zod-openapi";
import status from "http-status";

const TAG = ["images"];

// 미리 서명된 URL 생성 요청 스키마
const createUploadRequestSchema = z.object({
  contentType: z.string(),
  size: z.number().optional(),
  customMetadata: z.record(z.unknown()).optional(),
});

// 업로드 완료 요청 스키마
const completeUploadSchema = z.object({
  id: z.number(),
});

export const createUploadRequest = createRoute({
  method: "post",
  path: "/upload/request",
  tags: TAG,
  request: {
    body: {
      content: {
        "application/json": {
          schema: createUploadRequestSchema,
        },
      },
    },
  },
  responses: {
    [status.OK]: {
      description: "미리 서명된 URL 생성 성공",
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            uploadUrl: z.string(),
          }),
        },
      },
    },
  },
});

export const completeUpload = createRoute({
  method: "post",
  path: "/upload/complete",
  tags: TAG,
  request: {
    body: {
      content: {
        "application/json": {
          schema: completeUploadSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "업로드 완료 처리 성공",
    },
  },
});
