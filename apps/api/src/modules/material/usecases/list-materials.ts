import { ok, safeTry } from "neverthrow";

import { createPaginationMeta } from "../../../lib/pagination";
import { isoDateRequired } from "../../../lib/utils/date";
import { parseOrInternalError } from "../../../lib/zod";
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

      const response = yield* parseOrInternalError(
        ListMaterialsResponse,
        {
          data: rows.map((row) => ({
            id: row.id,
            title: row.title,

            mimeType: row.mimeType ?? null,
            fileSize: row.fileSize ?? null,
            processingStatus: row.processingStatus,
            summary: row.summary ?? null,
            createdAt: isoDateRequired(row.createdAt),
            updatedAt: isoDateRequired(row.updatedAt),
          })),
          meta: createPaginationMeta(total, input.page, input.limit),
        },
        "ListMaterialsResponse",
      );

      return ok(response);
    });
  };
}
