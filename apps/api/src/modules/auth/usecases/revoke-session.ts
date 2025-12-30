import { revokeSession as revokeSessionRecord } from "../auth.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";

export async function revokeSession(
  sessionId: string,
): Promise<Result<void, AppError>> {
  return revokeSessionRecord(sessionId, new Date());
}
