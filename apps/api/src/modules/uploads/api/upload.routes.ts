import { createRoute } from "@hono/zod-openapi";
import { authMiddleware } from "../../auth/middleware/auth.middleware";
import {
  errorResponseSchema,
  PresignedUploadUrlRequestSchema,
  PresignedUploadUrlResponseSchema,
} from "./upload.schema";

export const getSignedUploadUrlRoute = createRoute({
  method: "post",
  path: "/uploads/signed-url",
  tags: ["Upload"],
  summary: "Get signed upload URL",
  middleware: [authMiddleware] as const,
  request: {
    body: {
      content: {
        "application/json": {
          schema: PresignedUploadUrlRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PresignedUploadUrlResponseSchema,
        },
      },
      description: "서명된 업로드 URL 생성 성공",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "잘못된 요청",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "인증 필요",
    },
  },
});
