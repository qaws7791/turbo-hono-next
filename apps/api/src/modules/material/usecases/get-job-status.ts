import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { JobStatusResponse } from "../material.dto";
import { materialRepository } from "../material.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { JobStatusResponse as JobStatusResponseType } from "../material.dto";

export async function getJobStatus(
  userId: string,
  jobId: string,
): Promise<Result<JobStatusResponseType, AppError>> {
  // 1. Job 조회
  const jobResult = await materialRepository.findJobStatusRow(jobId);
  if (jobResult.isErr()) return err(jobResult.error);
  const row = jobResult.value;

  if (!row || row.materialUserId !== userId) {
    return err(
      new ApiError(404, "JOB_NOT_FOUND", "작업을 찾을 수 없습니다.", {
        jobId,
      }),
    );
  }

  // 2. 현재 단계 결정
  const currentStep =
    row.jobType === "TEXT_EXTRACT"
      ? "parsing"
      : row.jobType === "CHUNK"
        ? "chunking"
        : row.jobType === "EMBED"
          ? "embedding"
          : row.jobType.toLowerCase();

  // 3. 에러 정보 구성
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

  // 4. 결과 정보 구성
  const result =
    row.status === "SUCCEEDED"
      ? { materialId: row.materialId, summary: row.summary ?? null }
      : null;

  return ok(
    JobStatusResponse.parse({
      data: {
        jobId: row.jobId,
        status: row.status,
        progress: row.progress ? Number(row.progress) : null,
        currentStep,
        result,
        error,
      },
    }),
  );
}
