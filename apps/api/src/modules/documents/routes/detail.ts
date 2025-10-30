import { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { learningPlanDocument } from "@repo/database/schema";
import { documentDetailRoute } from "@repo/api-spec/modules/documents/routes";

import { db } from "../../../database/client";
import { authMiddleware } from "../../../middleware/auth";
import { DocumentError } from "../errors";

import type { AuthContext } from "../../../middleware/auth";

const detail = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  {
    ...documentDetailRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const auth = c.get("auth");
      const userId = auth.user.id;
      const { publicId } = c.req.valid("param");

      // Query document
      const [document] = await db
        .select()
        .from(learningPlanDocument)
        .where(eq(learningPlanDocument.publicId, publicId))
        .limit(1);

      // Check if document exists
      if (!document) {
        throw new DocumentError(
          404,
          "document:document_not_found",
          "Document not found",
        );
      }

      // Check ownership
      if (document.userId !== userId) {
        throw new DocumentError(
          403,
          "document:access_denied",
          "You don't have permission to access this document",
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
        200,
      );
    } catch (error) {
      if (error instanceof DocumentError) {
        throw error;
      }

      console.error("Document detail error:", error);
      throw new DocumentError(
        500,
        "document:internal_error",
        "An unexpected error occurred",
      );
    }
  },
);

export default detail;
