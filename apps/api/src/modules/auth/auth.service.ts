import { validateRedirectPath } from "./auth.utils";
import { getSessionByToken } from "./usecases/get-session";
import { requestMagicLink } from "./usecases/request-magic-link";
import { revokeSession } from "./usecases/revoke-session";
import { verifyGoogleOAuth } from "./usecases/verify-google-oauth";
import { verifyMagicLink } from "./usecases/verify-magic-link";

import type { Config } from "../../lib/config";
import type { AuthRepository } from "./auth.repository";

export type AuthServiceDeps = {
  readonly authRepository: AuthRepository;
  readonly config: Config;
};

export type AuthService = {
  readonly getSessionByToken: ReturnType<typeof getSessionByToken>;
  readonly requestMagicLink: ReturnType<typeof requestMagicLink>;
  readonly revokeSession: ReturnType<typeof revokeSession>;
  readonly validateRedirectPath: typeof validateRedirectPath;
  readonly verifyGoogleOAuth: ReturnType<typeof verifyGoogleOAuth>;
  readonly verifyMagicLink: ReturnType<typeof verifyMagicLink>;
};

export function createAuthService(deps: AuthServiceDeps): AuthService {
  const usecaseDeps = {
    authRepository: deps.authRepository,
    config: deps.config,
  } as const;

  return {
    getSessionByToken: getSessionByToken(usecaseDeps),
    requestMagicLink: requestMagicLink(usecaseDeps),
    revokeSession: revokeSession(usecaseDeps),
    validateRedirectPath,
    verifyGoogleOAuth: verifyGoogleOAuth(usecaseDeps),
    verifyMagicLink: verifyMagicLink(usecaseDeps),
  };
}
