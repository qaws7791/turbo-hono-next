import type { paths } from "~/modules/api";

export type HomeQueueApiResponse =
  paths["/api/home/queue"]["get"]["responses"][200]["content"]["application/json"];
