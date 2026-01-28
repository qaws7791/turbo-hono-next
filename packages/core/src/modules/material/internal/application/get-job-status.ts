import { err, ok, safeTry } from "neverthrow";
import { z } from "zod";

import { coreError } from "../../../../common/core-error";
import { internalError } from "../../../../common/result";
import { JobStatusSchema } from "../../api/schema";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../../common/result";
import type { JobStatusResponse as JobStatusResponseType } from "../../api/schema";
import type { MaterialRepository } from "../infrastructure/material.repository";

const JobErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
});

export function getJobStatus(deps: {
  readonly materialRepository: MaterialRepository;
}) {
  return function getJobStatus(
    userId: string,
    jobId: string,
  ): ResultAsync<JobStatusResponseType, AppError> {
    return safeTry(async function* () {
      const row = yield* deps.materialRepository.findJobStatusRow(jobId);
      if (!row || row.materialUserId !== userId) {
        return err(
          coreError({
            code: "JOB_NOT_FOUND",
            message: "작업을 찾을 수 없습니다.",
            details: { jobId },
          }),
        );
      }

      const statusParsed = JobStatusSchema.safeParse(row.status);
      if (!statusParsed.success) {
        return err(
          coreError({
            code: "JOB_STATUS_UNKNOWN",
            message: "작업 상태가 올바르지 않습니다.",
            details: { status: row.status },
          }),
        );
      }

      const currentStep = yield* (() => {
        switch (row.jobType) {
          case "TEXT_EXTRACT":
            return ok("parsing");
          case "CHUNK":
            return ok("chunking");
          case "EMBED":
            return ok("embedding");
          default:
            return err(
              coreError({
                code: "JOB_TYPE_UNKNOWN",
                message: "작업 유형이 올바르지 않습니다.",
                details: { jobType: row.jobType },
              }),
            );
        }
      })();

      const error =
        row.status === "FAILED" && row.errorJson
          ? yield* (() => {
              const parsed = JobErrorSchema.safeParse(row.errorJson);
              if (!parsed.success) {
                return err(
                  internalError("JobError 파싱에 실패했습니다.", {
                    issues: parsed.error.issues,
                  }),
                );
              }
              return ok(parsed.data);
            })()
          : null;

      const result =
        row.status === "SUCCEEDED"
          ? { materialId: row.materialId, summary: row.summary ?? null }
          : null;

      return ok({
        data: {
          jobId: row.jobId,
          status: statusParsed.data,
          progress: row.progress ? Number(row.progress) : null,
          currentStep,
          result,
          error,
        },
      });
    });
  };
}
