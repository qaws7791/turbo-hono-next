import { validateRedirectPath } from "../internal/domain/auth.utils";
import { getSessionByToken } from "../internal/application/get-session";
import { requestMagicLink } from "../internal/application/request-magic-link";
import { revokeSession } from "../internal/application/revoke-session";
import { verifyGoogleOAuth } from "../internal/application/verify-google-oauth";
import { verifyMagicLink } from "../internal/application/verify-magic-link";
import { createAuthRepository } from "../internal/infrastructure/auth.repository";

import type { Database } from "@repo/database";
import type { AuthConfig } from "./config";
import type { AuthLoggerPort } from "./ports";

export * from "./schema";
export * from "./types";
export * from "./config";
export * from "./ports";

export type CreateAuthServiceDeps = {
  readonly db: Database;
  readonly config: AuthConfig;
  readonly logger: AuthLoggerPort;
};

export type AuthService = {
  readonly getSessionByToken: ReturnType<typeof getSessionByToken>;
  readonly requestMagicLink: ReturnType<typeof requestMagicLink>;
  readonly revokeSession: ReturnType<typeof revokeSession>;
  readonly validateRedirectPath: typeof validateRedirectPath;
  readonly verifyGoogleOAuth: ReturnType<typeof verifyGoogleOAuth>;
  readonly verifyMagicLink: ReturnType<typeof verifyMagicLink>;
};

export function createAuthService(deps: CreateAuthServiceDeps): AuthService {
  const authRepository = createAuthRepository({
    db: deps.db,
    config: deps.config,
    logger: deps.logger,
  });

  const usecaseDeps = { authRepository, config: deps.config } as const;

  return {
    getSessionByToken: getSessionByToken(usecaseDeps),
    requestMagicLink: requestMagicLink(usecaseDeps),
    revokeSession: revokeSession({ authRepository }),
    validateRedirectPath,
    verifyGoogleOAuth: verifyGoogleOAuth(usecaseDeps),
    verifyMagicLink: verifyMagicLink(usecaseDeps),
  };
}
