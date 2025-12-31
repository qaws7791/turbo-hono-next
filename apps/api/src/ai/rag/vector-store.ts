import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { OpenAIEmbeddings } from "@langchain/openai";
import pg from "pg";

import { CONFIG } from "../../lib/config";
import { ApiError } from "../../middleware/error-handler";

import type { Pool, PoolConfig } from "pg";

const TABLE_NAME = "rag_documents";
const COLLECTION_TABLE_NAME = "rag_collections";

const COLUMN_CONFIG = {
  idColumnName: "id",
  vectorColumnName: "vector",
  contentColumnName: "content",
  metadataColumnName: "metadata",
} as const;

const MODEL_DIMENSIONS: Record<string, number> = {
  "text-embedding-3-small": 1536,
  "text-embedding-3-large": 3072,
  "text-embedding-ada-002": 1536,
};

let sharedPool: Pool | null = null;
let sharedEmbeddings: OpenAIEmbeddings | null = null;
let initPromise: Promise<void> | null = null;

function normalizeModelName(value: string): string {
  let normalized = value.trim();
  normalized = normalized.replace(/,+$/, "");

  const quotePairs: ReadonlyArray<readonly [string, string]> = [
    ['"', '"'],
    ["'", "'"],
    ["`", "`"],
  ];

  for (const [start, end] of quotePairs) {
    if (normalized.startsWith(start) && normalized.endsWith(end)) {
      normalized = normalized.slice(
        start.length,
        normalized.length - end.length,
      );
      break;
    }
  }

  normalized = normalized.replace(/^["'`]+/, "").replace(/["'`]+$/, "");
  normalized = normalized.trim().replace(/,+$/, "");
  return normalized;
}

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

function requireDatabaseUrl(): string {
  if (!CONFIG.DATABASE_URL) {
    throw new ApiError(500, "CONFIG_ERROR", "DATABASE_URL is required");
  }
  return CONFIG.DATABASE_URL;
}

function getPool(): Pool {
  if (sharedPool) return sharedPool;
  const databaseUrl = requireDatabaseUrl();
  sharedPool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: inferSslConfig(databaseUrl),
    max: 10,
  });
  return sharedPool;
}

function getEmbeddings(): OpenAIEmbeddings {
  if (sharedEmbeddings) return sharedEmbeddings;

  const model = normalizeModelName(CONFIG.OPENAI_EMBEDDING_MODEL);
  sharedEmbeddings = new OpenAIEmbeddings({
    apiKey: CONFIG.OPENAI_API_KEY,
    model,
  });

  return sharedEmbeddings;
}

function collectionNameForSpace(spaceId: number): string {
  return `space:${spaceId}`;
}

async function ensureInitialized(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const pool = getPool();

    // PGVectorStore.ensureTableInDatabase() uses gen_random_uuid()
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    const model = normalizeModelName(CONFIG.OPENAI_EMBEDDING_MODEL);
    const dimensions = MODEL_DIMENSIONS[model];

    const store = await PGVectorStore.initialize(getEmbeddings(), {
      pool,
      tableName: TABLE_NAME,
      collectionTableName: COLLECTION_TABLE_NAME,
      columns: COLUMN_CONFIG,
      distanceStrategy: "cosine",
      dimensions,
    });

    store.client?.release();
    store.client = undefined;
  })();

  return initPromise;
}

export async function getVectorStoreForSpace(params: {
  readonly spaceId: number;
}): Promise<PGVectorStore> {
  await ensureInitialized();

  return new PGVectorStore(getEmbeddings(), {
    pool: getPool(),
    tableName: TABLE_NAME,
    collectionTableName: COLLECTION_TABLE_NAME,
    collectionName: collectionNameForSpace(params.spaceId),
    columns: COLUMN_CONFIG,
    distanceStrategy: "cosine",
    skipInitializationCheck: true,
  });
}
