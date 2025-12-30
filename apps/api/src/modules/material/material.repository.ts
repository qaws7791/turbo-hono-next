import {
  materialChunks,
  materialEmbeddings,
  materialJobs,
  materialTags,
  materialUploads,
  materials,
  planSourceMaterials,
  plans,
  tags,
} from "@repo/database/schema";
import { and, asc, desc, eq, ilike, inArray, isNull, sql } from "drizzle-orm";

import { getDb } from "../../lib/db";
import { tryPromise } from "../../lib/result";

import type { AppError } from "../../lib/result";
import type { MaterialProcessingStatus } from "./material.dto";
import type { ResultAsync } from "neverthrow";

type MaterialSort = Array<ReturnType<typeof asc> | ReturnType<typeof desc>>;

function parseSort(sort: string | undefined): MaterialSort {
  const value = (sort ?? "createdAt:desc").trim();
  const parts = value.length > 0 ? value.split(",") : ["createdAt:desc"];

  const orderBys: MaterialSort = [];

  for (const part of parts) {
    const [fieldRaw, dirRaw] = part.split(":");
    const field = (fieldRaw ?? "").trim();
    const dir = (dirRaw ?? "desc").trim().toLowerCase();
    const isAsc = dir === "asc";

    switch (field) {
      case "title":
        orderBys.push(isAsc ? asc(materials.title) : desc(materials.title));
        break;
      case "processingStatus":
      case "status":
        orderBys.push(
          isAsc
            ? asc(materials.processingStatus)
            : desc(materials.processingStatus),
        );
        break;
      case "createdAt":
      default:
        orderBys.push(
          isAsc ? asc(materials.createdAt) : desc(materials.createdAt),
        );
        break;
    }
  }

  return orderBys.length > 0 ? orderBys : [desc(materials.createdAt)];
}

export const materialRepository = {
  getTagMap(
    materialIds: ReadonlyArray<string>,
  ): ResultAsync<Map<string, Array<string>>, AppError> {
    return tryPromise(async () => {
      if (materialIds.length === 0) return new Map<string, Array<string>>();

      const db = getDb();
      const rows = await db
        .select({
          materialId: materialTags.materialId,
          tag: tags.slug,
        })
        .from(materialTags)
        .innerJoin(tags, eq(tags.id, materialTags.tagId))
        .where(inArray(materialTags.materialId, [...materialIds]));

      const map = new Map<string, Array<string>>();
      rows.forEach((row) => {
        const list = map.get(row.materialId) ?? [];
        list.push(row.tag);
        map.set(row.materialId, list);
      });
      return map;
    });
  },

  countBySpaceId(
    userId: string,
    spaceId: number,
    filters: { status?: MaterialProcessingStatus; search?: string },
  ): ResultAsync<number, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const where = [
        eq(materials.userId, userId),
        eq(materials.spaceId, spaceId),
        isNull(materials.deletedAt),
      ];

      if (filters.status) {
        where.push(eq(materials.processingStatus, filters.status));
      }

      if (filters.search?.trim()) {
        where.push(ilike(materials.title, `%${filters.search.trim()}%`));
      }

      const rows = await db
        .select({ total: sql<number>`count(*)`.mapWith(Number) })
        .from(materials)
        .where(and(...where));
      return rows[0]?.total ?? 0;
    });
  },

  listBySpaceId(
    userId: string,
    spaceId: number,
    params: {
      page: number;
      limit: number;
      status?: MaterialProcessingStatus;
      search?: string;
      sort?: string;
    },
  ): ResultAsync<
    Array<{
      id: string;
      title: string;
      sourceType: string;
      mimeType: string | null;
      fileSize: number | null;
      processingStatus: MaterialProcessingStatus;
      summary: string | null;
      createdAt: Date;
    }>,
    AppError
  > {
    return tryPromise(() => {
      const db = getDb();
      const where = [
        eq(materials.userId, userId),
        eq(materials.spaceId, spaceId),
        isNull(materials.deletedAt),
      ];

      if (params.status) {
        where.push(eq(materials.processingStatus, params.status));
      }

      if (params.search?.trim()) {
        where.push(ilike(materials.title, `%${params.search.trim()}%`));
      }

      const offset = (params.page - 1) * params.limit;
      return db
        .select({
          id: materials.id,
          title: materials.title,
          sourceType: materials.sourceType,
          mimeType: materials.mimeType,
          fileSize: materials.fileSize,
          processingStatus: materials.processingStatus,
          summary: materials.summary,
          createdAt: materials.createdAt,
        })
        .from(materials)
        .where(and(...where))
        .orderBy(...parseSort(params.sort))
        .limit(params.limit)
        .offset(offset);
    });
  },

  findByIdForUser(
    userId: string,
    materialId: string,
  ): ResultAsync<typeof materials.$inferSelect | null, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select()
        .from(materials)
        .where(and(eq(materials.id, materialId), eq(materials.userId, userId)))
        .limit(1);
      return rows[0] ?? null;
    });
  },

  countChunks(materialId: string): ResultAsync<number, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({ count: sql<number>`count(*)` })
        .from(materialChunks)
        .where(eq(materialChunks.materialId, materialId));
      return rows[0]?.count ?? 0;
    });
  },

  updateTitle(
    userId: string,
    materialId: string,
    title: string,
    updatedAt: Date,
  ): ResultAsync<
    { id: string; title: string; updatedAt: Date } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .update(materials)
        .set({ title, updatedAt })
        .where(and(eq(materials.id, materialId), eq(materials.userId, userId)))
        .returning({
          id: materials.id,
          title: materials.title,
          updatedAt: materials.updatedAt,
        });
      return rows[0] ?? null;
    });
  },

  findForDelete(
    userId: string,
    materialId: string,
  ): ResultAsync<
    {
      id: string;
      spaceId: number;
      deletedAt: Date | null;
      storageProvider: string | null;
      storageKey: string | null;
    } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          id: materials.id,
          spaceId: materials.spaceId,
          deletedAt: materials.deletedAt,
          storageProvider: materials.storageProvider,
          storageKey: materials.storageKey,
        })
        .from(materials)
        .where(and(eq(materials.id, materialId), eq(materials.userId, userId)))
        .limit(1);
      return rows[0] ?? null;
    });
  },

  insertUploadSession(
    data: typeof materialUploads.$inferInsert,
  ): ResultAsync<{ id: string }, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .insert(materialUploads)
        .values(data)
        .returning({ id: materialUploads.id });

      const row = rows[0];
      if (!row) {
        throw new Error("Failed to insert material upload session");
      }
      return row;
    });
  },

  findUploadSessionByIdForUser(
    uploadId: string,
    userId: string,
    spaceId: number,
  ): ResultAsync<
    {
      id: string;
      status: string;
      expiresAt: Date;
      completedAt: Date | null;
      objectKey: string;
      finalObjectKey: string | null;
      originalFilename: string | null;
      mimeType: string;
      fileSize: number;
      etag: string | null;
      materialId: string | null;
    } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          id: materialUploads.id,
          status: materialUploads.status,
          expiresAt: materialUploads.expiresAt,
          completedAt: materialUploads.completedAt,
          objectKey: materialUploads.objectKey,
          finalObjectKey: materialUploads.finalObjectKey,
          originalFilename: materialUploads.originalFilename,
          mimeType: materialUploads.mimeType,
          fileSize: materialUploads.fileSize,
          etag: materialUploads.etag,
          materialId: materialUploads.materialId,
        })
        .from(materialUploads)
        .where(
          and(
            eq(materialUploads.id, uploadId),
            eq(materialUploads.userId, userId),
            eq(materialUploads.spaceId, spaceId),
          ),
        )
        .limit(1);

      return rows[0] ?? null;
    });
  },

  updateUploadSession(
    uploadId: string,
    data: Partial<typeof materialUploads.$inferInsert>,
  ): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      await db
        .update(materialUploads)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(materialUploads.id, uploadId));
    });
  },

  hasPlanReferences(materialId: string): ResultAsync<boolean, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({ planId: planSourceMaterials.planId })
        .from(planSourceMaterials)
        .innerJoin(plans, eq(plans.id, planSourceMaterials.planId))
        .where(
          and(
            eq(planSourceMaterials.materialId, materialId),
            isNull(plans.deletedAt),
          ),
        )
        .limit(1);
      return Boolean(rows[0]);
    });
  },

  softDelete(materialId: string, now: Date): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      await db
        .update(materials)
        .set({ deletedAt: now, updatedAt: now })
        .where(eq(materials.id, materialId));
    });
  },

  hardDelete(materialId: string): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      await db.delete(materials).where(eq(materials.id, materialId));
    });
  },

  findJobStatusRow(jobId: string): ResultAsync<
    {
      jobId: string;
      status: string;
      progress: string | null;
      jobType: string;
      errorJson: Record<string, unknown> | null;
      materialId: string;
      summary: string | null;
      materialUserId: string;
    } | null,
    AppError
  > {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({
          jobId: materialJobs.id,
          status: materialJobs.status,
          progress: materialJobs.progress,
          jobType: materialJobs.jobType,
          errorJson: materialJobs.errorJson,
          materialId: materials.id,
          summary: materials.summary,
          materialUserId: materials.userId,
        })
        .from(materialJobs)
        .innerJoin(materials, eq(materials.id, materialJobs.materialId))
        .where(eq(materialJobs.id, jobId))
        .limit(1);
      return rows[0] ?? null;
    });
  },

  findDuplicateByChecksum(
    userId: string,
    spaceId: number,
    checksum: string,
  ): ResultAsync<{ id: string } | null, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({ id: materials.id })
        .from(materials)
        .where(
          and(
            eq(materials.userId, userId),
            eq(materials.spaceId, spaceId),
            eq(materials.checksum, checksum),
            isNull(materials.deletedAt),
          ),
        )
        .limit(1);
      return rows[0] ?? null;
    });
  },

  insertMaterial(
    data: typeof materials.$inferInsert,
  ): ResultAsync<{ id: string; title: string }, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const inserted = await db
        .insert(materials)
        .values(data)
        .returning({ id: materials.id, title: materials.title });

      const material = inserted[0];
      if (!material) {
        throw new Error("Failed to insert material");
      }
      return material;
    });
  },

  insertMaterialChunks(
    chunks: Array<typeof materialChunks.$inferInsert>,
  ): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      if (chunks.length > 0) {
        await db.insert(materialChunks).values(chunks);
      }
    });
  },

  updateMaterialSummary(
    materialId: string,
    summary: string | null,
    updatedAt: Date,
  ): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      await db
        .update(materials)
        .set({ summary, updatedAt })
        .where(eq(materials.id, materialId));
    });
  },

  updateMaterialStatus(
    materialId: string,
    status: MaterialProcessingStatus,
    processedAt: Date | null,
    errorMessage: string | null,
  ): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      await db
        .update(materials)
        .set({
          processingStatus: status,
          processedAt,
          errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(materials.id, materialId));
    });
  },

  insertMaterialEmbeddings(
    embeddings: Array<typeof materialEmbeddings.$inferInsert>,
  ): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      if (embeddings.length > 0) {
        await db.insert(materialEmbeddings).values(embeddings);
      }
    });
  },

  insertMaterialJob(
    data: typeof materialJobs.$inferInsert,
  ): ResultAsync<{ id: string }, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .insert(materialJobs)
        .values(data)
        .returning({ id: materialJobs.id });

      const job = rows[0];
      if (!job) {
        throw new Error("Failed to insert material job");
      }
      return job;
    });
  },

  updateMaterialJob(
    jobId: string,
    data: Partial<typeof materialJobs.$inferInsert>,
  ): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      await db.update(materialJobs).set(data).where(eq(materialJobs.id, jobId));
    });
  },

  getChunksForEmbedding(
    materialId: string,
  ): ResultAsync<Array<{ id: string; content: string }>, AppError> {
    return tryPromise(() => {
      const db = getDb();
      return db
        .select({
          id: materialChunks.id,
          content: materialChunks.content,
        })
        .from(materialChunks)
        .where(eq(materialChunks.materialId, materialId))
        .orderBy(asc(materialChunks.ordinal));
    });
  },

  deleteExistingEmbeddings(
    chunkIds: Array<string>,
    model: string,
  ): ResultAsync<void, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      if (chunkIds.length > 0) {
        await db
          .delete(materialEmbeddings)
          .where(
            and(
              inArray(materialEmbeddings.chunkId, chunkIds),
              eq(materialEmbeddings.model, model),
            ),
          );
      }
    });
  },

  getMaterialJobById(
    jobId: string,
  ): ResultAsync<{ id: string; status: string } | null, AppError> {
    return tryPromise(async () => {
      const db = getDb();
      const rows = await db
        .select({ id: materialJobs.id, status: materialJobs.status })
        .from(materialJobs)
        .where(eq(materialJobs.id, jobId))
        .limit(1);
      return rows[0] ?? null;
    });
  },
};
