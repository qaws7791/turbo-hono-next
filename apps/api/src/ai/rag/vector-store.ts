import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import pg from "pg";

import { CONFIG } from "../../lib/config";
import { ApiError } from "../../middleware/error-handler";

import { GoogleCustomEmbeddings } from "./google-embeddings";

import type { Pool, PoolConfig } from "pg";

const TABLE_NAME = "rag_documents";
const COLLECTION_TABLE_NAME = "rag_collections";

const COLUMN_CONFIG = {
  idColumnName: "id",
  vectorColumnName: "vector",
  contentColumnName: "content",
  metadataColumnName: "metadata",
} as const;

export class RagVectorStoreManager {
  private pool: Pool | null = null;

  private inferSslConfig(databaseUrl: string): PoolConfig["ssl"] | undefined {
    if (
      databaseUrl.includes("sslmode=require") ||
      databaseUrl.includes("ssl=true") ||
      databaseUrl.includes("channel_binding=require")
    ) {
      return { rejectUnauthorized: false };
    }
    return undefined;
  }

  private requireDatabaseUrl(): string {
    if (!CONFIG.DATABASE_URL) {
      throw new ApiError(500, "CONFIG_ERROR", "DATABASE_URL is required");
    }
    return CONFIG.DATABASE_URL;
  }

  public getPool(): Pool {
    if (this.pool) return this.pool;
    const databaseUrl = this.requireDatabaseUrl();
    this.pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: this.inferSslConfig(databaseUrl),
      max: 10,
    });
    return this.pool;
  }

  private collectionNameForUser(userId: string): string {
    return `user:${userId}`;
  }

  public async getStoreForUser(params: {
    readonly userId: string;
  }): Promise<PGVectorStore> {
    return new PGVectorStore(
      new GoogleCustomEmbeddings({
        apiKey: CONFIG.GEMINI_EMBEDDING_API_KEY,
        model: CONFIG.GEMINI_EMBEDDING_MODEL,
      }),
      {
        pool: this.getPool(),
        tableName: TABLE_NAME,
        collectionTableName: COLLECTION_TABLE_NAME,
        collectionName: this.collectionNameForUser(params.userId),
        columns: COLUMN_CONFIG,
        distanceStrategy: "cosine",
        skipInitializationCheck: true,
      },
    );
  }
}

export const ragVectorStoreManager = new RagVectorStoreManager();
