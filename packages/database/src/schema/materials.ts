import { sql } from "drizzle-orm";
import {
  bigint,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

import {
  materialJobStatusEnum,
  materialJobTypeEnum,
  materialProcessingStatusEnum,
  materialUploadStatusEnum,
  outlineNodeTypeEnum,
  storageProviderEnum,
} from "./enums";
import { users } from "./identity";
import { timestamps } from "./shared";

/* ========== 4) Materials ========== */

export const materials = pgTable(
  "materials",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    originalFilename: text("original_filename"),
    sourceUrl: text("source_url"),
    storageProvider: storageProviderEnum("storage_provider").default("R2"),
    storageKey: text("storage_key"),
    mimeType: text("mime_type"),
    fileSize: bigint("file_size", { mode: "number" }),
    checksum: text("checksum"),
    processingStatus: materialProcessingStatusEnum("processing_status")
      .notNull()
      .default("PENDING"),
    processingProgress: integer("processing_progress"),
    processingStep: text("processing_step"),
    processedAt: timestamp("processed_at", {
      withTimezone: true,
      mode: "date",
    }),
    summary: text("summary"),
    errorMessage: text("error_message"),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
    ...timestamps,
  },
  (table) => [
    index("materials_user_id_idx").on(table.userId),
    index("materials_user_id_created_at_idx").on(table.userId, table.createdAt),
    index("materials_user_id_not_deleted_idx")
      .on(table.userId)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);

export const materialUploads = pgTable(
  "material_uploads",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: materialUploadStatusEnum("status").notNull().default("INITIATED"),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),
    errorMessage: text("error_message"),
    objectKey: text("object_key").notNull(),
    finalObjectKey: text("final_object_key"),
    originalFilename: text("original_filename"),
    mimeType: text("mime_type").notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull(),
    etag: text("etag"),
    materialId: uuid("material_id").references(() => materials.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    index("material_uploads_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    index("material_uploads_expires_at_idx").on(table.expiresAt),
    index("material_uploads_status_idx").on(table.status),
  ],
);

export const materialJobs = pgTable(
  "material_jobs",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    materialId: uuid("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    jobType: materialJobTypeEnum("job_type").notNull(),
    status: materialJobStatusEnum("status").notNull().default("QUEUED"),
    progress: numeric("progress"),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }),
    finishedAt: timestamp("finished_at", { withTimezone: true, mode: "date" }),
    errorJson: jsonb("error_json").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("material_jobs_material_id_idx").on(table.materialId),
    index("material_jobs_status_idx").on(table.status),
  ],
);

export const materialChunks = pgTable(
  "material_chunks",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    materialId: uuid("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    ordinal: integer("ordinal").notNull(),
    content: text("content").notNull(),
    tokenCount: integer("token_count"),
    pageStart: integer("page_start"),
    pageEnd: integer("page_end"),
    sectionPath: text("section_path"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("material_chunks_material_id_ordinal_unique").on(
      table.materialId,
      table.ordinal,
    ),
    index("material_chunks_material_id_idx").on(table.materialId),
  ],
);

export const materialEmbeddings = pgTable(
  "material_embeddings",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    chunkId: uuid("chunk_id")
      .notNull()
      .references(() => materialChunks.id, { onDelete: "cascade" }),
    model: text("model").notNull(),
    vector: vector("vector", { dimensions: 1536 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index("material_embeddings_chunk_id_idx").on(table.chunkId)],
);

export const outlineNodes = pgTable(
  "outline_nodes",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    materialId: uuid("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    nodeType: outlineNodeTypeEnum("node_type").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    keywords: text("keywords").array(),
    orderIndex: integer("order_index").notNull(),
    depth: integer("depth").notNull(),
    path: text("path").notNull(),
    metadataJson: jsonb("metadata_json").$type<{
      pageStart?: number;
      pageEnd?: number;
      lineStart?: number;
      lineEnd?: number;
    }>(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("outline_nodes_material_id_idx").on(table.materialId),
    index("outline_nodes_parent_id_idx").on(table.parentId),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    })
      .onDelete("cascade")
      .onUpdate("no action"),
  ],
);
