import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { assertSpaceOwned } from "../../space";
import { ConceptDetailResponse } from "../concept.dto";
import { conceptRepository } from "../concept.repository";
import { computeReviewStatus, extractSrsState } from "../concept.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { ConceptDetailResponse as ConceptDetailResponseType } from "../concept.dto";

export async function getConceptDetail(
  userId: string,
  conceptId: string,
): Promise<Result<ConceptDetailResponseType, AppError>> {
  // 1. Concept 상세 조회
  const conceptResult = await conceptRepository.findDetailByPublicId(
    userId,
    conceptId,
  );
  if (conceptResult.isErr()) return err(conceptResult.error);
  const concept = conceptResult.value;

  if (!concept) {
    return err(
      new ApiError(404, "CONCEPT_NOT_FOUND", "Concept를 찾을 수 없습니다.", {
        conceptId,
      }),
    );
  }

  // 2. Space 소유권 확인
  const spaceResult = await assertSpaceOwned(userId, concept.spaceId);
  if (spaceResult.isErr()) return err(spaceResult.error);

  // 3. 태그 맵 조회
  const tagMapResult = await conceptRepository.getTagMap([concept.id]);
  if (tagMapResult.isErr()) return err(tagMapResult.error);
  const tagMap = tagMapResult.value;

  // 4. 관련 Concept 조회
  const relatedResult = await conceptRepository.listRelatedConcepts(
    userId,
    concept.id,
  );
  if (relatedResult.isErr()) return err(relatedResult.error);
  const related = relatedResult.value;

  // 5. 학습 이력 조회
  const historyResult = await conceptRepository.listLearningHistory(
    userId,
    concept.id,
  );
  if (historyResult.isErr()) return err(historyResult.error);
  const history = historyResult.value;

  // 6. SRS 상태 구성
  const state = extractSrsState(concept.srsStateJson);
  const srsState =
    concept.srsDueAt && state
      ? {
          interval: state.interval,
          ease: state.ease,
          dueAt: concept.srsDueAt.toISOString(),
        }
      : null;

  return ok(
    ConceptDetailResponse.parse({
      data: {
        id: concept.publicId,
        spaceId: concept.spacePublicId,
        title: concept.title,
        oneLiner: concept.oneLiner,
        ariNoteMd: concept.ariNoteMd,
        tags: tagMap.get(concept.id) ?? [],
        reviewStatus: computeReviewStatus(concept.srsDueAt),
        relatedConcepts: related.map((r) => ({
          id: r.id,
          title: r.title,
          oneLiner: r.oneLiner,
          reviewStatus: computeReviewStatus(r.srsDueAt),
        })),
        learningHistory: history.map((h) => ({
          sessionRunId: h.sessionRunId,
          linkType: h.linkType,
          date: h.createdAt.toISOString(),
          planId: h.planId,
          planTitle: h.planTitle,
          moduleTitle: h.moduleTitle,
          sessionTitle: h.sessionTitle,
        })),
        srsState,
      },
    }),
  );
}
