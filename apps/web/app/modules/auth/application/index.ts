// Queries
export { useAuthMeQuery } from "./queries";

// Mutations
export { useLogoutMutation, useMagicLinkMutation } from "./mutations";

// Flows
export {
  fetchAuthMeOrNull,
  logoutAndClearCache,
  sendMagicLink,
  startGoogleAuth,
  useRedirectToLoginOnUnauthorized,
} from "./flows";

// Keys
export { authKeys } from "./keys";
