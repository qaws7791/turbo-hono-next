import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { SearchConceptsInput, SearchConceptsResponse } from "../concept.dto";
import { conceptRepository } from "../concept.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  SearchConceptsInput as SearchConceptsInputType,
  SearchConceptsResponse as SearchConceptsResponseType,
} from "../concept.dto";

export async function searchConcepts(
  userId: string,
  input: SearchConceptsInputType,
): Promise<Result<SearchConceptsResponseType, AppError>> {
  // 1. 입력 검증
  const parseResult = SearchConceptsInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  // 2. Space ID 확인 (선택적)
  let resolvedSpaceIds: Array<number> | undefined;
  if (validated.spaceIds?.length) {
    const resolveResult = await conceptRepository.resolveSpaceIds(
      userId,
      validated.spaceIds,
    );
    if (resolveResult.isErr()) return err(resolveResult.error);

    if (resolveResult.value.length === 0) {
      return ok(SearchConceptsResponse.parse({ data: [] }));
    }
    resolvedSpaceIds = resolveResult.value;
  }

  // 3. 검색 수행
  const searchResult = await conceptRepository.search(userId, {
    q: validated.q,
    spaceIds: resolvedSpaceIds,
  });
  if (searchResult.isErr()) return err(searchResult.error);
  const rows = searchResult.value;

  return ok(SearchConceptsResponse.parse({ data: rows }));
}
