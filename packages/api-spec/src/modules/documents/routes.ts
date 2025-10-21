import { createRoute, z } from "@hono/zod-openapi";
import {
  DocumentItemSchema,
  DocumentUploadResponseSchema,
  DocumentErrorResponseSchema,
} from "./schema";

export const documentDetailRoute = createRoute({
  tags: ["Documents"],
  method: "get",
  path: "/documents/{publicId}",
  summary: "Get document details",
  description: "Retrieve detailed information about a specific document",
  request: {
    params: z.object({
      publicId: z.string().openapi({
        description: "Document public ID",
        example: "550e8400-e29b-41d4-a716-446655440000",
      }),
    }),
  },
  responses: {
    200: {
      description: "Document retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            document: DocumentItemSchema,
          }),
        },
      },
    },
    401: {
      description: "Authentication required",
      content: {
        "application/json": {
          schema: DocumentErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Access denied",
      content: {
        "application/json": {
          schema: DocumentErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Document not found",
      content: {
        "application/json": {
          schema: DocumentErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: DocumentErrorResponseSchema,
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
  tags: ["Documents"],
  method: "post",
  path: "/documents/upload",
  summary: "Upload a PDF document",
  description:
    "Upload a PDF file to R2 storage. The file will be validated and text extraction will begin in the background.",
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
                description: "PDF file to upload (max 10MB)",
              },
            },
            required: ["file"],
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Document uploaded successfully",
      content: {
        "application/json": {
          schema: DocumentUploadResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - invalid file",
      content: {
        "application/json": {
          schema: DocumentErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Authentication required",
      content: {
        "application/json": {
          schema: DocumentErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: DocumentErrorResponseSchema,
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

export const documentRoutes = [documentDetailRoute, documentUploadRoute] as const;
