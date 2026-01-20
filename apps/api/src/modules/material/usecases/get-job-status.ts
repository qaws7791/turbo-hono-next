import { err, ok, safeTry } from "neverthrow";
import { z } from "zod";

import { ApiError } from "../../../middleware/error-handler";
import { parseOrInternalError } from "../../../lib/zod";
import { JobStatusResponse } from "../material.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { JobStatusResponse as JobStatusResponseType } from "../material.dto";
import type { MaterialRepository } from "../material.repository";

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
          new ApiError(404, "JOB_NOT_FOUND", "작업을 찾을 수 없습니다.", {
            jobId,
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
              new ApiError(
                500,
                "JOB_TYPE_UNKNOWN",
                "작업 유형이 올바르지 않습니다.",
                { jobType: row.jobType },
              ),
            );
        }
      })();

      const error =
        row.status === "FAILED" && row.errorJson
          ? yield* parseOrInternalError(
              JobErrorSchema,
              row.errorJson,
              "JobError",
            )
          : null;

      const result =
        row.status === "SUCCEEDED"
          ? { materialId: row.materialId, summary: row.summary ?? null }
          : null;

      const response = yield* parseOrInternalError(
        JobStatusResponse,
        {
          data: {
            jobId: row.jobId,
            status: row.status,
            progress: row.progress ? Number(row.progress) : null,
            currentStep,
            result,
            error,
          },
        },
        "JobStatusResponse",
      );

      return ok(response);
    });
  };
}
