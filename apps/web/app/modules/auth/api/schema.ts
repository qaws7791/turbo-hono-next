import type { paths } from "~/modules/api";

export type AuthMeApiResponse =
  paths["/api/auth/me"]["get"]["responses"][200]["content"]["application/json"];

export type MagicLinkApiBody = NonNullable<
  paths["/api/auth/magic-link"]["post"]["requestBody"]
>["content"]["application/json"];
