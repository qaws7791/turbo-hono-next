import { OpenAPIHono } from "@hono/zod-openapi";
import { documentUploadRoute } from "@repo/api-spec/modules/documents/routes";

import { log } from "../../../lib/logger";
import { authMiddleware } from "../../../middleware/auth";
import {
  sanitizeFileName,
  validateFileSize,
  validatePdfFile,
} from "../../../utils/pdf";
import { generateStorageKey, uploadToR2 } from "../../../utils/r2";
import { documentService } from "../services/document.service";
import { DocumentErrors } from "../errors";

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
        throw DocumentErrors.validationFailed({
          message: "No file provided or invalid file",
        });
      }

      // Validate file size (10MB max)
      if (!validateFileSize(file.size)) {
        throw DocumentErrors.tooLarge();
      }

      // Read file as buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Validate PDF file
      const isValidPdf = await validatePdfFile(buffer);
      if (!isValidPdf) {
        throw DocumentErrors.invalidType();
      }

      // Generate storage key
      const sanitizedFileName = sanitizeFileName(file.name);
      const storageKey = generateStorageKey(userId, sanitizedFileName);

      // Upload to R2
      let storageUrl: string;
      try {
        storageUrl = await uploadToR2(storageKey, buffer, "application/pdf");
      } catch (error) {
        log.error("R2 upload failed", error);
        throw DocumentErrors.uploadFailed({
          message: "Failed to upload file to storage",
        });
      }

      // Save to database via service
      const document = await documentService.uploadDocument({
        userId,
        fileName: sanitizedFileName,
        fileSize: file.size,
        fileType: "application/pdf",
        storageKey,
        storageUrl,
      });

      return c.json(
        {
          success: true,
          document,
        },
        201,
      );
    } catch (error) {
      // Re-throw known errors
      if (error && typeof error === "object" && "code" in error) {
        throw error;
      }

      // Handle unexpected errors
      log.error("Document upload error", error);
      throw DocumentErrors.uploadFailed({
        message: "An unexpected error occurred during upload",
      });
    }
  },
);

export default upload;
