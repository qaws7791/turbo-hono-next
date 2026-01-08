import type { User } from "../model/types";
import type { ApiAuthUser } from "./auth.dto";

export function toUserFromApi(apiUser: ApiAuthUser): User {
  return {
    id: apiUser.id,
    name: apiUser.displayName,
    email: apiUser.email,
    plan: apiUser.subscriptionPlan.toLowerCase() as "free" | "pro",
  };
}
