import { OpenAPIHono } from "@hono/zod-openapi";
import { documentDetailRoute } from "@repo/api-spec/modules/documents/routes";

import { extractAuthContext } from "../../../lib/auth-context.helper";
import { log } from "../../../lib/logger";
import { authMiddleware } from "../../../middleware/auth";
import { DocumentErrors } from "../errors";
import { documentService } from "../services/document.service";

const detail = new OpenAPIHono().openapi(
  {
    ...documentDetailRoute,
    middleware: [authMiddleware] as const,
  },
  async (c) => {
    try {
      const { userId } = extractAuthContext(c);
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

      log.error("Document detail error", error);
      throw DocumentErrors.storageError({
        message: "An unexpected error occurred",
      });
    }
  },
);

export default detail;
