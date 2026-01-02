import type { paths } from "~/modules/api";

export type JobStatusApiResponse =
  paths["/api/jobs/{jobId}"]["get"]["responses"][200]["content"]["application/json"];
