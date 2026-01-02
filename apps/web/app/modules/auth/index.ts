// ============================================================
// Domain Layer - Business Types and Utils
// ============================================================
export type {
  AuthMeResponse,
  AuthUser,
  LoginActionData,
  LoginViewState,
} from "./domain";

export { formatSeconds } from "./domain";

// ============================================================
// API Layer - API Functions
// ============================================================
export { buildGoogleAuthUrl } from "./api";
export type { MagicLinkApiBody } from "./api";

// ============================================================
// Application Layer - React Hooks and State Management
// ============================================================
export {
  authKeys,
  fetchAuthMeOrNull,
  logoutAndClearCache,
  sendMagicLink,
  startGoogleAuth,
  useAuthMeQuery,
  useLogoutMutation,
  useMagicLinkMutation,
  useRedirectToLoginOnUnauthorized,
} from "./application";

// ============================================================
// UI Layer - Components and Views
// ============================================================
export { LoginView } from "./ui";
