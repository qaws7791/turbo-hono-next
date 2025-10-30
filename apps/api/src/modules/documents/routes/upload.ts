import { OpenAPIHono } from "@hono/zod-openapi";
import { learningPlanDocument } from "@repo/database/schema";
import { documentUploadRoute } from "@repo/api-spec/modules/documents/routes";

import { db } from "../../../database/client";
import { authMiddleware } from "../../../middleware/auth";
import {
  sanitizeFileName,
  validateFileSize,
  validatePdfFile,
} from "../../../utils/pdf";
import { generateStorageKey, uploadToR2 } from "../../../utils/r2";
import { DocumentError } from "../errors";

import type { AuthContext } from "../../../middleware/auth";

const upload = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...documentUploadRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const userId = auth.user.id;

      // Parse multipart form data
      const body = await c.req.parseBody();
      const file = body["file"];

      // Validate file exists
      if (!file || !(file instanceof File)) {
        throw new DocumentError(
          400,
          "document:missing_file",
          "No file provided or invalid file",
        );
      }

      // Validate file size (10MB max)
      if (!validateFileSize(file.size)) {
        throw new DocumentError(
          400,
          "document:file_too_large",
          "File size exceeds 10MB limit",
        );
      }

      // Read file as buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Validate PDF file
      const isValidPdf = await validatePdfFile(buffer);
      if (!isValidPdf) {
        throw new DocumentError(
          400,
          "document:invalid_file_type",
          "Only PDF files are allowed",
        );
      }

      // Generate storage key
      const sanitizedFileName = sanitizeFileName(file.name);
      const storageKey = generateStorageKey(userId, sanitizedFileName);

      // Upload to R2
      let storageUrl: string;
      try {
        storageUrl = await uploadToR2(storageKey, buffer, "application/pdf");
      } catch (error) {
        console.error("R2 upload failed:", error);
        throw new DocumentError(
          500,
          "document:upload_failed",
          "Failed to upload file to storage",
        );
      }

      // Save to database
      const [document] = await db
        .insert(learningPlanDocument)
        .values({
          userId,
          fileName: sanitizedFileName,
          fileSize: file.size,
          fileType: "application/pdf",
          storageKey,
          storageUrl,
        })
        .returning();

      if (!document) {
        throw new DocumentError(
          500,
          "document:upload_failed",
          "Failed to persist uploaded document",
        );
      }

      return c.json(
        {
          success: true,
          document: {
            id: document.publicId,
            fileName: document.fileName,
            fileSize: document.fileSize,
            fileType: document.fileType,
            storageUrl: document.storageUrl,
            learningPlanId: document.learningPlanId,
            uploadedAt: document.uploadedAt.toISOString(),
            createdAt: document.createdAt.toISOString(),
          },
        },
        201,
      );
    } catch (error) {
      // Re-throw DocumentError
      if (error instanceof DocumentError) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Document upload error:", error);
      throw new DocumentError(
        500,
        "document:internal_error",
        "An unexpected error occurred during upload",
      );
    }
  },
);

export default upload;
