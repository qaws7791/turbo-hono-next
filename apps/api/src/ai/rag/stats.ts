import { tryPromise } from "../../lib/result";
import { ApiError } from "../../middleware/error-handler";

import { getVectorStoreForUser } from "./vector-store";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../lib/result";

function parseCount(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function countMaterialChunks(params: {
  readonly userId: string;
  readonly materialId: string;
}): ResultAsync<number, AppError> {
  return tryPromise(async () => {
    const store = await getVectorStoreForUser({ userId: params.userId });
    const collectionId = await store.getOrCreateCollection();

    const query = `
      SELECT count(*) as count
      FROM ${store.computedTableName}
      WHERE collection_id = $1
        AND ${store.metadataColumnName}->>'userId' = $2
        AND ${store.metadataColumnName}->>'materialId' = $3
    `;

    const result = await store.pool.query(query, [
      collectionId,
      params.userId,
      params.materialId,
    ]);

    const row = result.rows[0];
    if (!row) {
      throw new ApiError(
        500,
        "MATERIAL_INDEX_FAILED",
        "인덱스 상태를 확인할 수 없습니다.",
      );
    }

    return parseCount(row.count);
  });
}

/**
 * 자료별 청크 통계 정보
 */
export type MaterialChunkStats = {
  readonly materialId: string;
  readonly chunkCount: number;
  readonly estimatedMinutes: number; // chunkCount * 5분 기준
};

/**
 * 여러 자료의 청크 통계를 한 번에 조회
 */
export function getMaterialsChunkStats(params: {
  readonly userId: string;
  readonly materialIds: ReadonlyArray<string>;
}): ResultAsync<Map<string, MaterialChunkStats>, AppError> {
  return tryPromise(async () => {
    if (params.materialIds.length === 0) {
      return new Map<string, MaterialChunkStats>();
    }

    const store = await getVectorStoreForUser({ userId: params.userId });
    const collectionId = await store.getOrCreateCollection();

    // 모든 자료의 청크 수를 한 번의 쿼리로 조회
    const placeholders = params.materialIds
      .map((_, idx) => `$${idx + 3}`)
      .join(", ");

    const query = `
      SELECT 
        ${store.metadataColumnName}->>'materialId' as material_id,
        count(*) as chunk_count
      FROM ${store.computedTableName}
      WHERE collection_id = $1
        AND ${store.metadataColumnName}->>'userId' = $2
        AND ${store.metadataColumnName}->>'materialId' IN (${placeholders})
      GROUP BY ${store.metadataColumnName}->>'materialId'
    `;

    const result = await store.pool.query(query, [
      collectionId,
      params.userId,
      ...params.materialIds,
    ]);

    const statsMap = new Map<string, MaterialChunkStats>();

    // 쿼리 결과를 Map으로 변환
    for (const row of result.rows) {
      const materialId = String(row.material_id);
      const chunkCount = parseCount(row.chunk_count);
      statsMap.set(materialId, {
        materialId,
        chunkCount,
        estimatedMinutes: Math.ceil(chunkCount * 5), // 청크당 5분 예상
      });
    }

    // 쿼리 결과에 없는 자료는 0으로 설정
    for (const materialId of params.materialIds) {
      if (!statsMap.has(materialId)) {
        statsMap.set(materialId, {
          materialId,
          chunkCount: 0,
          estimatedMinutes: 0,
        });
      }
    }

    return statsMap;
  });
}
