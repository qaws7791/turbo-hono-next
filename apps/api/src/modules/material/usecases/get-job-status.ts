import { tryPromise, unwrap } from "../../../lib/result";
import { ApiError } from "../../../middleware/error-handler";
import { JobStatusResponse } from "../material.dto";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { JobStatusResponse as JobStatusResponseType } from "../material.dto";
import type { MaterialRepository } from "../material.repository";

export function getJobStatus(deps: {
  readonly materialRepository: MaterialRepository;
}) {
  return function getJobStatus(
    userId: string,
    jobId: string,
  ): ResultAsync<JobStatusResponseType, AppError> {
    return tryPromise(async () => {
      const row = await unwrap(deps.materialRepository.findJobStatusRow(jobId));

      if (!row || row.materialUserId !== userId) {
        throw new ApiError(404, "JOB_NOT_FOUND", "작업을 찾을 수 없습니다.", {
          jobId,
        });
      }

      const currentStep =
        row.jobType === "TEXT_EXTRACT"
          ? "parsing"
          : row.jobType === "CHUNK"
            ? "chunking"
            : row.jobType === "EMBED"
              ? "embedding"
              : row.jobType.toLowerCase();

      const error =
        row.status === "FAILED" && row.errorJson
          ? {
              code:
                typeof row.errorJson.code === "string"
                  ? row.errorJson.code
                  : "JOB_FAILED",
              message:
                typeof row.errorJson.message === "string"
                  ? row.errorJson.message
                  : "작업이 실패했습니다.",
            }
          : null;

      const result =
        row.status === "SUCCEEDED"
          ? { materialId: row.materialId, summary: row.summary ?? null }
          : null;

      return JobStatusResponse.parse({
        data: {
          jobId: row.jobId,
          status: row.status,
          progress: row.progress ? Number(row.progress) : null,
          currentStep,
          result,
          error,
        },
      });
    });
  };
}
