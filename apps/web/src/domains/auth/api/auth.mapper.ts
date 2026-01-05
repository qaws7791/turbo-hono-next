import type { ApiAuthUser } from "./auth.dto";
import type { User } from "../model/types";

export function toUserFromApi(apiUser: ApiAuthUser): User {
  return {
    id: apiUser.id,
    name: apiUser.displayName,
    email: apiUser.email,
    plan: "free",
  };
}
