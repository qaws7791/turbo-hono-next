import { ok, safeTry } from "neverthrow";

import { isoDateRequired } from "../../../../common/date";
import { createPaginationMeta } from "../../../../common/pagination";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type {
  ListMaterialsInput as ListMaterialsInputType,
  ListMaterialsResponse as ListMaterialsResponseType,
} from "../../api/schema";
import type { MaterialRepository } from "../infrastructure/material.repository";

export function listMaterials(deps: {
  readonly materialRepository: MaterialRepository;
}) {
  return function listMaterials(
    userId: string,
    input: ListMaterialsInputType,
  ): ResultAsync<ListMaterialsResponseType, AppError> {
    return safeTry(async function* () {
      const total = yield* deps.materialRepository.countByUserId(userId, {
        status: input.status,
        search: input.search,
      });

      const rows = yield* deps.materialRepository.listByUserId(userId, {
        page: input.page,
        limit: input.limit,
        status: input.status,
        search: input.search,
        sort: input.sort,
      });

      return ok({
        data: rows.map((row) => ({
          id: row.id,
          title: row.title,
          mimeType: row.mimeType ?? null,
          fileSize: row.fileSize ?? null,
          processingStatus: row.processingStatus,
          processingProgress: row.processingProgress ?? null,
          processingStep: row.processingStep ?? null,
          processingError: row.errorMessage ?? null,
          summary: row.summary ?? null,
          createdAt: isoDateRequired(row.createdAt),
          updatedAt: isoDateRequired(row.updatedAt),
        })),
        meta: createPaginationMeta(total, input.page, input.limit),
      });
    });
  };
}
