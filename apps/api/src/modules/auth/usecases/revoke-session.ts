import type { AppError } from "../../../lib/result";
import type { AuthRepository } from "../auth.repository";
import type { ResultAsync } from "neverthrow";

export function revokeSession(deps: {
  readonly authRepository: AuthRepository;
}) {
  return function revokeSession(
    sessionId: string,
  ): ResultAsync<void, AppError> {
    return deps.authRepository.revokeSession(sessionId, new Date());
  };
}
