import type { paths } from "~/foundation/types/api";

export type AuthMeOk =
  paths["/api/auth/me"]["get"]["responses"]["200"]["content"]["application/json"];

export type ApiAuthUser = AuthMeOk["data"];

type MagicLinkRequestBody = NonNullable<
  paths["/api/auth/magic-link"]["post"]["requestBody"]
>;

export type MagicLinkBody = MagicLinkRequestBody["content"]["application/json"];

export type MagicLinkOk =
  paths["/api/auth/magic-link"]["post"]["responses"]["200"]["content"]["application/json"];

export type LogoutOk =
  paths["/api/auth/logout"]["post"]["responses"]["200"]["content"]["application/json"];
