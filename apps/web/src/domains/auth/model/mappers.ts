import type { paths } from "~/foundation/types/api";
import type { User } from "./types";

type AuthUserResponse =
  paths["/api/auth/me"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export function toUserFromApi(apiUser: AuthUserResponse): User {
  return {
    id: apiUser.id,
    name: apiUser.displayName,
    email: apiUser.email,
    plan: "free", // TODO: API에서 받아오는 게 베스트이나 현재는 고정값
  };
}
