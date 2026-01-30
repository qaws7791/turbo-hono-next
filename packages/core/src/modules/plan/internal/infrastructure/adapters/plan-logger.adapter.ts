import type { PlanLoggerPort } from "../../../api/ports/plan-logger.port";

export function createPlanLoggerPort(logger: {
  readonly info: (obj: unknown, msg?: string) => void;
  readonly error: (obj: unknown, msg?: string) => void;
}): PlanLoggerPort {
  return {
    info: (obj, msg) => logger.info(obj, msg),
    error: (obj, msg) => logger.error(obj, msg),
  };
}
