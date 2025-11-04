import { z } from "@hono/zod-openapi";

export const DocumentItemSchema = z.object({
  id: z.string().openapi({
    description: "Public ID of the document",
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  fileName: z.string().openapi({
    description: "Original file name",
    example: "learning-guide.pdf",
  }),
  fileSize: z.number().int().openapi({
    description: "File size in bytes",
    example: 1048576,
  }),
  fileType: z.string().openapi({
    description: "MIME type of the file",
    example: "application/pdf",
  }),
  storageUrl: z.string().openapi({
    description: "Public URL to access the file",
    example: "https://pub-xxx.r2.dev/pdfs/user123/1234567890-uuid.pdf",
  }),
  learningPlanId: z.number().int().nullable().openapi({
    description: "Associated learningPlan ID (null if not yet linked)",
    example: 123,
  }),
  uploadedAt: z.string().openapi({
    description: "Upload timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
  createdAt: z.string().openapi({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
});

export const DocumentListResponseSchema = z.object({
  documents: z.array(DocumentItemSchema).openapi({
    description: "List of documents",
  }),
  total: z.number().int().openapi({
    description: "Total number of documents",
    example: 5,
  }),
});

export const DocumentUploadResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Upload success status",
    example: true,
  }),
  document: DocumentItemSchema.openapi({
    description: "Uploaded document information",
  }),
});

export const DocumentDeleteResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Deletion success status",
    example: true,
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Document deleted successfully",
  }),
});

export const DocumentErrorResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Request success status",
    example: false,
  }),
  error: z.object({
    code: z.string().openapi({
      description: "Error code",
      example: "document:invalid_file_type",
    }),
    message: z.string().openapi({
      description: "Error message",
      example: "Only PDF files are allowed",
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
