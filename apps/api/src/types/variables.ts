import type { AuthContext } from "../middleware/auth";

/**
 * Variables for routes that require authentication
 */
export type AuthVariables = {
  auth: AuthContext;
};

/**
 * Variables for routes that have optional authentication
 */
export type OptionalAuthVariables = {
  auth?: AuthContext;
};
