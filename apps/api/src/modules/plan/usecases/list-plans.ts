import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { ListPlansInput, ListPlansResponse } from "../plan.dto";
import { planRepository } from "../plan.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  ListPlansInput as ListPlansInputType,
  ListPlansResponse as ListPlansResponseType,
} from "../plan.dto";

export async function listPlans(
  userId: string,
  input: ListPlansInputType,
): Promise<Result<ListPlansResponseType, AppError>> {
  // 1. 입력 검증
  const parseResult = ListPlansInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  // 2. 총 개수 조회
  const countResult = await planRepository.countByUserId(
    userId,
    validated.status,
  );
  if (countResult.isErr()) return err(countResult.error);
  const total = countResult.value;

  // 3. 목록 조회
  const listResult = await planRepository.listByUserId(userId, {
    page: validated.page,
    limit: validated.limit,
    status: validated.status,
  });
  if (listResult.isErr()) return err(listResult.error);
  const planRows = listResult.value;

  // 4. 진행률 맵 조회
  const progressMapResult = await planRepository.getProgressMap(
    planRows.map((row) => row.id),
  );
  if (progressMapResult.isErr()) return err(progressMapResult.error);
  const progressMap = progressMapResult.value;

  // 5. 소스 자료 ID 맵 조회
  const sourceMaterialIdsMapResult =
    await planRepository.getSourceMaterialIdsMap(planRows.map((row) => row.id));
  if (sourceMaterialIdsMapResult.isErr())
    return err(sourceMaterialIdsMapResult.error);
  const sourceMaterialIdsMap = sourceMaterialIdsMapResult.value;

  return ok(
    ListPlansResponse.parse({
      data: planRows.map((row) => {
        const progress = progressMap.get(row.id) ?? {
          totalSessions: 0,
          completedSessions: 0,
        };
        const sourceMaterialIds = sourceMaterialIdsMap.get(row.id) ?? [];

        return {
          id: row.publicId,
          title: row.title,
          icon: row.icon,
          color: row.color,
          status: row.status,
          goalType: row.goalType,
          currentLevel: row.currentLevel,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
          progress: {
            completedSessions: progress.completedSessions,
            totalSessions: progress.totalSessions,
          },
          sourceMaterialIds,
        };
      }),
      meta: { total, page: validated.page, limit: validated.limit },
    }),
  );
}
