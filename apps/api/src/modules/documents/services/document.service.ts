import { eq } from "drizzle-orm";
import { learningPlanDocument } from "@repo/database/schema";

import { db } from "../../../database/client";
import { log } from "../../../lib/logger";
import { DocumentError, DocumentErrors } from "../errors";

/**
 * Input type for uploading a document
 */
export interface UploadDocumentInput {
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageKey: string;
  storageUrl: string;
}

/**
 * Input type for getting document detail
 */
export interface GetDocumentDetailInput {
  publicId: string;
  userId: string;
}

/**
 * Document response format
 */
export interface DocumentResponse {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageUrl: string;
  learningPlanId: number | null;
  uploadedAt: string;
  createdAt: string;
}

/**
 * Service layer for document operations.
 * Handles document metadata storage and retrieval.
 */
export class DocumentService {
  /**
   * Saves document metadata to database after successful upload
   * @param input - Document metadata
   * @returns Document information
   */
  async uploadDocument(input: UploadDocumentInput): Promise<DocumentResponse> {
    try {
      const { userId, fileName, fileSize, fileType, storageKey, storageUrl } =
        input;

      // Save to database
      const [document] = await db
        .insert(learningPlanDocument)
        .values({
          userId,
          fileName,
          fileSize,
          fileType,
          storageKey,
          storageUrl,
        })
        .returning();

      if (!document) {
        throw DocumentErrors.uploadFailed({
          message: "Failed to persist uploaded document",
        });
      }

      log.info("Document uploaded successfully", {
        publicId: document.publicId,
        userId,
        fileName,
      });

      return {
        id: document.publicId,
        fileName: document.fileName,
        fileSize: document.fileSize,
        fileType: document.fileType,
        storageUrl: document.storageUrl,
        learningPlanId: document.learningPlanId,
        uploadedAt: document.uploadedAt.toISOString(),
        createdAt: document.createdAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof DocumentError) {
        throw error;
      }

      log.error("Document upload failed", error, {
        userId: input.userId,
        fileName: input.fileName,
      });

      throw DocumentErrors.uploadFailed({
        message: "An unexpected error occurred during upload",
      });
    }
  }

  /**
   * Retrieves document details by public ID
   * @param input - Document query parameters
   * @returns Document information
   */
  async getDocumentDetail(
    input: GetDocumentDetailInput,
  ): Promise<DocumentResponse> {
    try {
      const { publicId, userId } = input;

      // Query document
      const [document] = await db
        .select()
        .from(learningPlanDocument)
        .where(eq(learningPlanDocument.publicId, publicId))
        .limit(1);

      // Check if document exists
      if (!document) {
        throw DocumentErrors.notFound();
      }

      // Check ownership
      if (document.userId !== userId) {
        throw DocumentErrors.accessDenied();
      }

      log.info("Document retrieved successfully", {
        publicId,
        userId,
      });

      return {
        id: document.publicId,
        fileName: document.fileName,
        fileSize: document.fileSize,
        fileType: document.fileType,
        storageUrl: document.storageUrl,
        learningPlanId: document.learningPlanId,
        uploadedAt: document.uploadedAt.toISOString(),
        createdAt: document.createdAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof DocumentError) {
        throw error;
      }

      log.error("Document retrieval failed", error, {
        publicId: input.publicId,
        userId: input.userId,
      });

      throw DocumentErrors.storageError({
        message: "An unexpected error occurred",
      });
    }
  }

  /**
   * Links a document to a learning plan
   * @param input - Document and learning plan IDs
   */
  async linkToLearningPlan(input: {
    publicId: string;
    userId: string;
    learningPlanId: number;
  }): Promise<void> {
    try {
      const { publicId, userId, learningPlanId } = input;

      // Verify document exists and user owns it
      const [document] = await db
        .select()
        .from(learningPlanDocument)
        .where(eq(learningPlanDocument.publicId, publicId))
        .limit(1);

      if (!document) {
        throw DocumentErrors.notFound();
      }

      if (document.userId !== userId) {
        throw DocumentErrors.accessDenied();
      }

      // Link document to learning plan
      await db
        .update(learningPlanDocument)
        .set({ learningPlanId })
        .where(eq(learningPlanDocument.publicId, publicId));

      log.info("Document linked to learning plan successfully", {
        publicId,
        userId,
        learningPlanId,
      });
    } catch (error) {
      if (error instanceof DocumentError) {
        throw error;
      }

      log.error("Failed to link document to learning plan", error, {
        publicId: input.publicId,
        userId: input.userId,
      });

      throw DocumentErrors.storageError({
        message: "Failed to link document to learning plan",
      });
    }
  }
}

// Export singleton instance
export const documentService = new DocumentService();
