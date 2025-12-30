import { requestMagicLink } from "./usecases/request-magic-link";
import { revokeSession } from "./usecases/revoke-session";
import { verifyGoogleOAuth } from "./usecases/verify-google-oauth";
import { verifyMagicLink } from "./usecases/verify-magic-link";
import { getSessionByToken } from "./usecases/get-session";

export type { AuthContext, RequestContext } from "./types";

export { validateRedirectPath } from "./auth.utils";

export {
  getSessionByToken,
  requestMagicLink,
  revokeSession,
  verifyGoogleOAuth,
  verifyMagicLink,
};
