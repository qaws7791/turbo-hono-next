import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { assertSpaceOwned } from "../../space";
import {
  CreateConceptReviewInput,
  CreateConceptReviewResponse,
} from "../concept.dto";
import { conceptRepository } from "../concept.repository";
import {
  addDays,
  calculateNextSrs,
  extractSrsState,
  getTodayStart,
} from "../concept.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  CreateConceptReviewInput as CreateConceptReviewInputType,
  CreateConceptReviewResponse as CreateConceptReviewResponseType,
} from "../concept.dto";

export async function createConceptReview(
  userId: string,
  conceptId: string,
  input: CreateConceptReviewInputType,
): Promise<Result<CreateConceptReviewResponseType, AppError>> {
  const now = new Date();

  // 1. 입력 검증
  const parseResult = CreateConceptReviewInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  // 2. Concept 조회
  const conceptResult = await conceptRepository.findForReview(
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

  // 3. Space 소유권 확인
  const spaceResult = await assertSpaceOwned(userId, concept.spaceId);
  if (spaceResult.isErr()) return err(spaceResult.error);

  // 4. 세션 Run ID 확인 (선택적)
  let sessionRunId: number | null = null;
  if (validated.sessionRunId) {
    const runResult = await conceptRepository.findSessionRunByPublicId(
      userId,
      validated.sessionRunId,
    );
    if (runResult.isErr()) return err(runResult.error);
    const run = runResult.value;

    if (!run) {
      return err(
        new ApiError(404, "SESSION_NOT_FOUND", "세션을 찾을 수 없습니다.", {
          runId: validated.sessionRunId,
        }),
      );
    }
    sessionRunId = run.id;
  }

  // 5. SRS 계산
  const current = extractSrsState(concept.srsStateJson) ?? {
    interval: 1,
    ease: 2.5,
  };
  const next = calculateNextSrs(current, validated.rating);
  const nextDueAt = addDays(getTodayStart(), next.interval);

  // 6. 리뷰 트랜잭션 생성
  const reviewResult = await conceptRepository.createReviewTransaction({
    conceptId: concept.id,
    sessionRunId,
    review: {
      rating: validated.rating,
      reviewedAt: now,
      nextDueAt,
      intervalDays: next.interval,
      easeFactor: String(next.ease),
    },
    srsUpdate: {
      srsDueAt: nextDueAt,
      srsStateJson: { interval: next.interval, ease: next.ease },
      lastReviewedAt: now,
    },
  });
  if (reviewResult.isErr()) return err(reviewResult.error);

  return ok(
    CreateConceptReviewResponse.parse({
      data: {
        nextDueAt: nextDueAt.toISOString(),
        newInterval: next.interval,
      },
    }),
  );
}
