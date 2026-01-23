import * as neverthrow from "neverthrow";

import { generatePublicId } from "../../../lib/public-id";
import { fromPromise, toAppError, toThrowable } from "../../../lib/result";
import { addDays, parseDateOnly } from "../../../lib/utils/date";

import type {
  PlanGenerationJobData,
  PlanGenerationJobResult,
  PlanGenerationProgress,
} from "../../../infrastructure/queue";
import type { AppError } from "../../../lib/result";
import type { PlanGenerationPort } from "../plan.ports";
import type { PlanRepository } from "../plan.repository";

const { err, ok } = neverthrow;

export type ProcessPlanGenerationDeps = {
  readonly planRepository: PlanRepository;
  readonly planGeneration: PlanGenerationPort;
};

type ProgressCallback = (
  step: PlanGenerationProgress["step"],
  progress: number,
  message?: string,
) => Promise<void>;

export function createPlanProcessor(deps: ProcessPlanGenerationDeps) {
  return function processPlan(
    jobData: PlanGenerationJobData,
    updateProgress: ProgressCallback,
  ): neverthrow.ResultAsync<PlanGenerationJobResult, AppError> {
    const run = async (): Promise<
      neverthrow.Result<PlanGenerationJobResult, AppError>
    > => {
      try {
        const { userId, planId, publicId, materialIds, targetDueDate } =
          jobData;

        const now = new Date();
        const markGeneratingResult =
          await deps.planRepository.updateGenerationStatus(planId, {
            generationStatus: "GENERATING",
            generationError: null,
            updatedAt: now,
          });
        if (markGeneratingResult.isErr()) {
          throw toThrowable(markGeneratingResult.error);
        }

        await updateProgress(
          "GENERATING",
          10,
          "AI가 학습 계획을 생성하고 있습니다...",
        );

        // 1. AI Plan 생성 호출
        const dueDate = targetDueDate
          ? parseDateOnly(targetDueDate.slice(0, 10))
          : null;

        const aiResult = await deps.planGeneration.generatePlan({
          userId,
          materialIds,
          targetDueDate: dueDate,
          specialRequirements: jobData.specialRequirements ?? null,
          requestedSessionCount: null,
        });

        if (aiResult.isErr()) {
          throw toThrowable(aiResult.error);
        }
        const aiPlan = aiResult.value;

        await updateProgress("FINALIZING", 80, "계획을 저장하고 있습니다...");

        // 2. DB 저장 준비
        const startDate = parseDateOnly(now.toISOString().slice(0, 10));

        // Modules 준비
        const moduleRows = aiPlan.modules.map((mod) => ({
          id: crypto.randomUUID(),
          planId, // will be set in repository
          title: mod.title,
          description: mod.description,
          orderIndex: mod.orderIndex,
          createdAt: now,
        }));

        // Sessions 준비
        const sessions = aiPlan.sessions.map((sess, idx) => {
          const moduleRow = moduleRows[sess.moduleIndex];
          if (!moduleRow) throw new Error("Invalid module index in AI plan");

          return {
            planId, // will be set in repository
            publicId: generatePublicId(),
            moduleId: moduleRow.id,
            sessionType: sess.sessionType,
            title: sess.title,
            objective: sess.objective,
            sourceReferences: [...sess.sourceReferences],
            orderIndex: idx,
            scheduledForDate: addDays(startDate, sess.dayOffset),
            estimatedMinutes: sess.estimatedMinutes,
            status: "SCHEDULED" as const,
            createdAt: now,
            updatedAt: now,
          };
        });

        // 3. DB 업데이트 (Content 채우기)
        const updateResult = await deps.planRepository.fillPlanContent({
          planId,
          updateData: {
            title: aiPlan.title,
            generationStatus: "READY",
            generationError: null,
            updatedAt: now,
          },
          moduleRows: moduleRows.map((m) => ({ ...m, planId })),
          sessionRows: sessions.map((s) => ({ ...s, planId })),
        });

        if (updateResult.isErr()) {
          throw toThrowable(updateResult.error);
        }

        // 4. 활성화 처리 (다른 Plan들 PAUSE 처리 등)
        // 한 유저당 ACTIVE Plan은 1개만 허용되므로, 기존 ACTIVE를 PAUSED로 바꾼 뒤
        // 이 Plan을 ACTIVE로 전환하는 트랜잭션을 호출합니다.

        const activateResult =
          await deps.planRepository.activatePlanTransaction({
            plan: { id: planId },
            userId,
            now,
          });
        if (activateResult.isErr()) {
          throw toThrowable(activateResult.error);
        }

        await updateProgress("COMPLETED", 100, "완료되었습니다.");

        return ok({
          planId,
          publicId,
          title: aiPlan.title,
          status: "ACTIVE",
          moduleCount: moduleRows.length,
          sessionCount: sessions.length,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";

        const failedAt = new Date();
        const failResult = await deps.planRepository.updateGenerationStatus(
          jobData.planId,
          {
            generationStatus: "FAILED",
            generationError: message,
            updatedAt: failedAt,
          },
        );
        if (failResult.isErr()) {
          // ignore
        }

        return err(toAppError(error));
      }
    };

    return fromPromise(run()).andThen((result) => result);
  };
}
