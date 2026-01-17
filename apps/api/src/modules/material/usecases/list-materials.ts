import { createPaginationMeta } from "../../../lib/pagination";
import { tryPromise, unwrap } from "../../../lib/result";
import { isoDateRequired } from "../../../lib/utils/date";
import { ListMaterialsResponse } from "../material.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  ListMaterialsInput as ListMaterialsInputType,
  ListMaterialsResponse as ListMaterialsResponseType,
} from "../material.dto";
import type { MaterialRepository } from "../material.repository";

export function listMaterials(deps: {
  readonly materialRepository: MaterialRepository;
}) {
  return function listMaterials(
    userId: string,
    input: ListMaterialsInputType,
  ): ResultAsync<ListMaterialsResponseType, AppError> {
    return tryPromise(async () => {
      const total = await unwrap(
        deps.materialRepository.countByUserId(userId, {
          status: input.status,
          search: input.search,
        }),
      );

      const rows = await unwrap(
        deps.materialRepository.listByUserId(userId, {
          page: input.page,
          limit: input.limit,
          status: input.status,
          search: input.search,
          sort: input.sort,
        }),
      );

      return ListMaterialsResponse.parse({
        data: rows.map((row) => ({
          id: row.id,
          title: row.title,
          sourceType: row.sourceType,
          mimeType: row.mimeType ?? null,
          fileSize: row.fileSize ?? null,
          processingStatus: row.processingStatus,
          summary: row.summary ?? null,
          createdAt: isoDateRequired(row.createdAt),
          updatedAt: isoDateRequired(row.updatedAt),
        })),
        meta: createPaginationMeta(total, input.page, input.limit),
      });
    });
  };
}
