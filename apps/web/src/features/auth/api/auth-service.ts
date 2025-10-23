import type { paths } from "@/api/schema";
import type { AuthUser } from "@/features/auth/types";

import { api } from "@/api/http-client";

type LoginResponse =
  paths["/auth/login"]["post"]["responses"][200]["content"]["application/json"]["user"];
type MeResponse =
  paths["/auth/me"]["get"]["responses"][200]["content"]["application/json"];

function mapUser(user: LoginResponse | MeResponse): AuthUser {
  return {
    id: user.id,
    username: user.name,
    email: user.email,
  };
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await api.auth.me();

  if (response.error || !response.data) {
    return null;
  }

  return mapUser(response.data);
}

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const response = await api.auth.login(email, password);

  if (response.error || !response.data?.user) {
    throw response.error ?? new Error("Login failed");
  }

  return mapUser(response.data.user);
}

export async function logout(): Promise<void> {
  await api.auth.logout();
}
