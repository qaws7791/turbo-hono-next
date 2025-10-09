import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import status from "http-status";
import { db } from "../../../database/client";
import { roadmapDocument } from "../../../database/schema";
import { AuthContext, authMiddleware } from "../../../middleware/auth";
import { DocumentError } from "../errors";
import { DocumentItemSchema, ErrorResponseSchema } from "../schema";

const detail = new OpenAPIHono<{
  Variables: {
    auth: AuthContext;
  };
}>().openapi(
  createRoute({
    tags: ["Documents"],
    method: "get",
    path: "/documents/{publicId}",
    summary: "Get document details",
    description: "Retrieve detailed information about a specific document",
    middleware: [authMiddleware] as const,
    request: {
      params: z.object({
        publicId: z.string().openapi({
          description: "Document public ID",
          example: "550e8400-e29b-41d4-a716-446655440000",
        }),
      }),
    },
    responses: {
      [status.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              document: DocumentItemSchema,
            }),
          },
        },
        description: "Document retrieved successfully",
      },
      [status.NOT_FOUND]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Document not found",
      },
      [status.FORBIDDEN]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Access denied",
      },
      [status.UNAUTHORIZED]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Authentication required",
      },
      [status.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const auth = c.get("auth");
      const userId = auth.user.id;
      const { publicId } = c.req.valid("param");

      // Query document
      const [document] = await db
        .select()
        .from(roadmapDocument)
        .where(eq(roadmapDocument.publicId, publicId))
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
            roadmapId: document.roadmapId,
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
