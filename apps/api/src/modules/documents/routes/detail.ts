import { OpenAPIHono } from "@hono/zod-openapi";
import { documentDetailRoute } from "@repo/api-spec/modules/documents/routes";

import { authMiddleware } from "../../../middleware/auth";
import { documentService } from "../services/document.service";
import { DocumentErrors } from "../errors";

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

      // Get document via service
      const document = await documentService.getDocumentDetail({
        publicId,
        userId,
      });

      return c.json(
        {
          success: true,
          document,
        },
        200,
      );
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        throw error;
      }

      console.error("Document detail error:", error);
      throw DocumentErrors.storageError({
        message: "An unexpected error occurred",
      });
    }
  },
);

export default detail;
