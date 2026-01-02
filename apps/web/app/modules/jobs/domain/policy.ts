import type { JobStatusState } from "./types";

export const JOB_POLL_INTERVAL_MS = 2000;

export function isJobTerminal(status: JobStatusState | undefined): boolean {
  return status === "SUCCEEDED" || status === "FAILED";
}
