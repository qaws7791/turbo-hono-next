import type { paths } from "~/types/api";

export type JobStatusResponse =
  paths["/api/jobs/{jobId}"]["get"]["responses"][200]["content"]["application/json"];

export type JobStatus = JobStatusResponse["data"];

