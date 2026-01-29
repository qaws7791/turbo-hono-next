import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import pg from "pg";

import { coreError } from "../../../../common/core-error";

import { KnowledgeEmbeddingsAdapter } from "./knowledge-embeddings.adapter";

import type { EmbeddingModelPort } from "@repo/ai";
import type { Pool, PoolConfig } from "pg";

const TABLE_NAME = "rag_documents";
const COLLECTION_TABLE_NAME = "rag_collections";

const COLUMN_CONFIG = {
  idColumnName: "id",
  vectorColumnName: "vector",
  contentColumnName: "content",
  metadataColumnName: "metadata",
} as const;

export type KnowledgeVectorStoreManager = {
  getPool: () => Pool;
  getStoreForUser: (params: {
    readonly userId: string;
  }) => Promise<PGVectorStore>;
};

function inferSslConfig(databaseUrl: string): PoolConfig["ssl"] | undefined {
  if (
    databaseUrl.includes("sslmode=require") ||
    databaseUrl.includes("ssl=true") ||
    databaseUrl.includes("channel_binding=require")
  ) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

export function createKnowledgeVectorStoreManager(deps: {
  readonly databaseUrl: string | null | undefined;
  readonly embeddingModel: EmbeddingModelPort;
}): KnowledgeVectorStoreManager {
  let pool: Pool | null = null;

  const requireDatabaseUrl = (): string => {
    if (!deps.databaseUrl) {
      throw coreError({
        code: "CONFIG_ERROR",
        message: "DATABASE_URL is required",
      });
    }
    return deps.databaseUrl;
  };

  return {
    getPool: () => {
      if (pool) return pool;
      const databaseUrl = requireDatabaseUrl();
      pool = new pg.Pool({
        connectionString: databaseUrl,
        ssl: inferSslConfig(databaseUrl),
        max: 10,
      });
      return pool;
    },
    getStoreForUser: async (params) => {
      return new PGVectorStore(
        new KnowledgeEmbeddingsAdapter({ embeddingModel: deps.embeddingModel }),
        {
          pool: (pool ??= new pg.Pool({
            connectionString: requireDatabaseUrl(),
            ssl: inferSslConfig(requireDatabaseUrl()),
            max: 10,
          })),
          tableName: TABLE_NAME,
          collectionTableName: COLLECTION_TABLE_NAME,
          collectionName: `user:${params.userId}`,
          columns: COLUMN_CONFIG,
          distanceStrategy: "cosine",
          skipInitializationCheck: true,
        },
      );
    },
  };
}
