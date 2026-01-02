import type { paths } from "~/types/api";
import type { Space, User } from "~/mock/schemas";

type AuthUser =
  paths["/api/auth/me"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

type ApiSpace =
  paths["/api/spaces"]["get"]["responses"]["200"]["content"]["application/json"]["data"][number];

export function toMockUser(user: AuthUser): User {
  return {
    id: user.id,
    name: user.displayName,
    email: user.email,
    plan: "free",
  };
}

export function toMockSpace(space: ApiSpace): Space {
  return {
    id: space.id,
    name: space.name,
    description: space.description ?? undefined,
    icon: space.icon ?? "book",
    color: space.color ?? "blue",
    createdAt: space.createdAt,
    updatedAt: space.updatedAt,
    activePlanId: undefined,
  };
}
