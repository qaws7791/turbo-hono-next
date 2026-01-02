import type { JobStatusApiResponse } from "../api/schema";

export type JobStatus = JobStatusApiResponse["data"];

export type JobStatusState = JobStatus["status"];

export type JobResult = NonNullable<JobStatus["result"]>;

export type JobError = NonNullable<JobStatus["error"]>;
