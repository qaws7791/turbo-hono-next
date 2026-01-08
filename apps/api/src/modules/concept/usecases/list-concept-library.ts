import { err, ok } from "neverthrow";

import { createPaginationMeta } from "../../../lib/pagination";
import { ApiError } from "../../../middleware/error-handler";
import {
  ConceptLibraryListItem,
  ListConceptLibraryInput,
  ListConceptLibraryResponse,
} from "../concept.dto";
import { conceptRepository } from "../concept.repository";
import { addDays, computeReviewStatus, getTodayStart } from "../concept.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  ListConceptLibraryInput as ListConceptLibraryInputType,
  ListConceptLibraryResponse as ListConceptLibraryResponseType,
} from "../concept.dto";

export async function listConceptLibrary(
  userId: string,
  input: ListConceptLibraryInputType,
): Promise<Result<ListConceptLibraryResponseType, AppError>> {
  const parseResult = ListConceptLibraryInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  const today = getTodayStart();
  const dueWindowEnd = addDays(today, 3);

  let spaceIds: Array<number> | undefined;
  if (validated.spaceIds && validated.spaceIds.length > 0) {
    const resolved = await conceptRepository.resolveSpaceIds(
      userId,
      validated.spaceIds,
    );
    if (resolved.isErr()) return err(resolved.error);
    spaceIds = resolved.value;
  }

  const totalResult = await conceptRepository.countLibrary(userId, {
    search: validated.search,
    reviewStatus: validated.reviewStatus,
    today,
    dueWindowEnd,
    spaceIds,
  });
  if (totalResult.isErr()) return err(totalResult.error);
  const total = totalResult.value;

  const listResult = await conceptRepository.listLibrary(userId, {
    page: validated.page,
    limit: validated.limit,
    search: validated.search,
    reviewStatus: validated.reviewStatus,
    today,
    dueWindowEnd,
    spaceIds,
  });
  if (listResult.isErr()) return err(listResult.error);
  const rows = listResult.value;

  const tagMapResult = await conceptRepository.getTagMap(
    rows.map((row) => row.id),
  );
  if (tagMapResult.isErr()) return err(tagMapResult.error);
  const tagMap = tagMapResult.value;

  const latestSourceMapResult = await conceptRepository.getLatestSourceMap(
    userId,
    rows.map((row) => row.id),
  );
  if (latestSourceMapResult.isErr()) return err(latestSourceMapResult.error);
  const latestSourceMap = latestSourceMapResult.value;

  return ok(
    ListConceptLibraryResponse.parse({
      data: rows.map((row) =>
        ConceptLibraryListItem.parse({
          id: row.publicId,
          spaceId: row.spaceId,
          title: row.title,
          oneLiner: row.oneLiner,
          tags: tagMap.get(row.id) ?? [],
          reviewStatus: computeReviewStatus(row.srsDueAt),
          srsDueAt: row.srsDueAt ? row.srsDueAt.toISOString() : null,
          lastLearnedAt: row.lastLearnedAt
            ? row.lastLearnedAt.toISOString()
            : null,
          latestSource: (() => {
            const source = latestSourceMap.get(row.id);
            if (!source) return null;
            return {
              sessionRunId: source.sessionRunId,
              linkType: source.linkType,
              date: source.createdAt.toISOString(),
              planId: source.planId,
              planTitle: source.planTitle,
              moduleTitle: source.moduleTitle,
              sessionTitle: source.sessionTitle,
            };
          })(),
        }),
      ),
      meta: createPaginationMeta(total, validated.page, validated.limit),
    }),
  );
}
