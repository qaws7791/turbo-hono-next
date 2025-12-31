import { ApiError } from "../../middleware/error-handler";
import { tryPromise } from "../../lib/result";

import { getVectorStoreForSpace } from "./vector-store";

import type { AppError } from "../../lib/result";
import type { ResultAsync } from "neverthrow";

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
  readonly spaceId: number;
  readonly materialId: string;
}): ResultAsync<number, AppError> {
  return tryPromise(async () => {
    const store = await getVectorStoreForSpace({ spaceId: params.spaceId });
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
