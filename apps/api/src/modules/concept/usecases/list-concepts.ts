import { err, ok } from "neverthrow";

import { createPaginationMeta } from "../../../lib/pagination";
import { ApiError } from "../../../middleware/error-handler";
import { assertSpaceOwned } from "../../space";
import { ListConceptsInput, ListConceptsResponse } from "../concept.dto";
import { conceptRepository } from "../concept.repository";
import { addDays, computeReviewStatus, getTodayStart } from "../concept.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  ListConceptsInput as ListConceptsInputType,
  ListConceptsResponse as ListConceptsResponseType,
} from "../concept.dto";

export async function listConcepts(
  userId: string,
  input: ListConceptsInputType,
): Promise<Result<ListConceptsResponseType, AppError>> {
  // 1. 입력 검증
  const parseResult = ListConceptsInput.safeParse(input);
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

  const today = getTodayStart();
  const dueWindowEnd = addDays(today, 3);

  // 3. 총 개수 조회
  const countResult = await conceptRepository.countList(userId, space.id, {
    search: validated.search,
    reviewStatus: validated.reviewStatus,
    today,
    dueWindowEnd,
  });
  if (countResult.isErr()) return err(countResult.error);
  const total = countResult.value;

  // 4. 목록 조회
  const listResult = await conceptRepository.list(userId, space.id, {
    page: validated.page,
    limit: validated.limit,
    search: validated.search,
    reviewStatus: validated.reviewStatus,
    today,
    dueWindowEnd,
  });
  if (listResult.isErr()) return err(listResult.error);
  const rows = listResult.value;

  // 5. 태그 맵 조회
  const tagMapResult = await conceptRepository.getTagMap(
    rows.map((row) => row.id),
  );
  if (tagMapResult.isErr()) return err(tagMapResult.error);
  const tagMap = tagMapResult.value;

  return ok(
    ListConceptsResponse.parse({
      data: rows.map((row) => ({
        id: row.publicId,
        title: row.title,
        oneLiner: row.oneLiner,
        tags: tagMap.get(row.id) ?? [],
        reviewStatus: computeReviewStatus(row.srsDueAt),
        srsDueAt: row.srsDueAt ? row.srsDueAt.toISOString() : null,
        lastLearnedAt: row.lastLearnedAt
          ? row.lastLearnedAt.toISOString()
          : null,
      })),
      meta: createPaginationMeta(total, validated.page, validated.limit),
    }),
  );
}
