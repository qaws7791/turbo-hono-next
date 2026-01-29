import "dotenv/config";

import pg from "pg";

import { CONFIG } from "../lib/config";

function inferSslConfig(databaseUrl: string): pg.PoolConfig["ssl"] | undefined {
  if (
    databaseUrl.includes("sslmode=require") ||
    databaseUrl.includes("ssl=true") ||
    databaseUrl.includes("channel_binding=require")
  ) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

async function main(): Promise<void> {
  const databaseUrl = CONFIG.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: inferSslConfig(databaseUrl),
    max: 1,
  });

  try {
    const before = await pool.query(`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (
          WHERE jsonb_typeof(metadata) = 'object'
            AND ((metadata ? 'materialId') OR (metadata ? 'materialTitle') OR (metadata ? 'source'))
        )::int AS old_keys_rows,
        count(*) FILTER (
          WHERE jsonb_typeof(metadata) = 'object'
            AND (metadata->>'type' = 'material')
            AND (metadata ? 'refId')
            AND (metadata ? 'title')
        )::int AS new_keys_rows
      FROM rag_documents
    `);

    const update = await pool.query(`
      UPDATE rag_documents
      SET metadata = jsonb_set(
        jsonb_set(
          jsonb_set(
            (metadata - 'materialId' - 'materialTitle' - 'source'),
            '{refId}',
            to_jsonb(metadata->>'materialId'),
            true
          ),
          '{type}',
          to_jsonb('material'::text),
          true
        ),
        '{title}',
        to_jsonb(metadata->>'materialTitle'),
        true
      )
      WHERE jsonb_typeof(metadata) = 'object'
        AND metadata ? 'materialId'
    `);

    const after = await pool.query(`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (
          WHERE jsonb_typeof(metadata) = 'object'
            AND ((metadata ? 'materialId') OR (metadata ? 'materialTitle') OR (metadata ? 'source'))
        )::int AS old_keys_rows,
        count(*) FILTER (
          WHERE jsonb_typeof(metadata) = 'object'
            AND (metadata->>'type' = 'material')
            AND (metadata ? 'refId')
            AND (metadata ? 'title')
        )::int AS new_keys_rows,
        count(*) FILTER (
          WHERE jsonb_typeof(metadata) = 'object'
            AND (metadata->>'type' = 'material')
            AND (coalesce(metadata->>'refId', '') = '')
        )::int AS empty_ref_id_rows,
        count(*) FILTER (
          WHERE jsonb_typeof(metadata) = 'object'
            AND (metadata->>'type' = 'material')
            AND (coalesce(metadata->>'title', '') = '')
        )::int AS empty_title_rows
      FROM rag_documents
    `);

    const sample = await pool.query(`
      SELECT id::text AS id, metadata
      FROM rag_documents
      WHERE jsonb_typeof(metadata) = 'object'
        AND metadata->>'type' = 'material'
      LIMIT 3
    `);

    const beforeRow = before.rows[0] ?? {};
    const afterRow = after.rows[0] ?? {};

    console.log(
      JSON.stringify(
        {
          table: "rag_documents",
          updatedRowCount: update.rowCount ?? 0,
          before: beforeRow,
          after: afterRow,
          sample: sample.rows,
        },
        null,
        2,
      ),
    );
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
