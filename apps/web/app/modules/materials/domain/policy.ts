import type { MaterialProcessingStatus } from "./types";

export function isMaterialReadyForPlan(input: {
  processingStatus: MaterialProcessingStatus;
}): boolean {
  return input.processingStatus === "READY";
}
