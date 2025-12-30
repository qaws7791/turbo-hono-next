import { err, ok } from "neverthrow";

import { createPaginationMeta } from "../../../lib/pagination";
import { ApiError } from "../../../middleware/error-handler";
import { assertSpaceOwned } from "../../space";
import { ListMaterialsInput, ListMaterialsResponse } from "../material.dto";
import { materialRepository } from "../material.repository";
import { isoDateRequired } from "../material.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  ListMaterialsInput as ListMaterialsInputType,
  ListMaterialsResponse as ListMaterialsResponseType,
} from "../material.dto";

export async function listMaterials(
  userId: string,
  input: ListMaterialsInputType,
): Promise<Result<ListMaterialsResponseType, AppError>> {
  // 1. 입력 검증
  const parseResult = ListMaterialsInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  // 2. Space 소유권 확인
  const spaceResult = await assertSpaceOwned(userId, validated.spaceId);
  if (spaceResult.isErr()) return err(spaceResult.error);
  const space = spaceResult.value;

  // 3. 총 개수 조회
  const countResult = await materialRepository.countBySpaceId(
    userId,
    space.id,
    {
      status: validated.status,
      search: validated.search,
    },
  );
  if (countResult.isErr()) return err(countResult.error);
  const total = countResult.value;

  // 4. 목록 조회
  const listResult = await materialRepository.listBySpaceId(userId, space.id, {
    page: validated.page,
    limit: validated.limit,
    status: validated.status,
    search: validated.search,
    sort: validated.sort,
  });
  if (listResult.isErr()) return err(listResult.error);
  const rows = listResult.value;

  // 5. 태그 맵 조회
  const tagMapResult = await materialRepository.getTagMap(
    rows.map((row) => row.id),
  );
  if (tagMapResult.isErr()) return err(tagMapResult.error);
  const tagMap = tagMapResult.value;

  return ok(
    ListMaterialsResponse.parse({
      data: rows.map((row) => ({
        id: row.id,
        title: row.title,
        sourceType: row.sourceType,
        mimeType: row.mimeType ?? null,
        fileSize: row.fileSize ?? null,
        processingStatus: row.processingStatus,
        summary: row.summary ?? null,
        tags: tagMap.get(row.id) ?? [],
        createdAt: isoDateRequired(row.createdAt),
      })),
      meta: createPaginationMeta(total, validated.page, validated.limit),
    }),
  );
}
