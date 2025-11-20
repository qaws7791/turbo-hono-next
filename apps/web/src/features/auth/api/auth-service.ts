import type { Result } from "@/shared/types/result";
import type { User } from "@/features/auth/model/types";

import { api } from "@/api/http-client";
import { mapApiUserToUser } from "@/features/auth/model/mappers";
import { failure, success } from "@/shared/types/result";

/**
 * API 에러를 Error 객체로 변환
 */
function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  if (
    error &&
    typeof error === "object" &&
    "error" in error &&
    error.error &&
    typeof error.error === "object" &&
    "message" in error.error
  ) {
    return new Error(String(error.error.message));
  }
  return new Error("Unknown error");
}

/**
 * 현재 로그인한 사용자 정보를 가져옵니다.
 *
 * React Query의 queryFn으로 사용됩니다.
 * - 인증된 경우: User 반환
 * - 인증되지 않은 경우: null 반환 (에러가 아님)
 *
 * @returns Promise<User | null>
 */
export async function fetchCurrentUser(): Promise<User | null> {
  const response = await api.auth.me();

  if (response.error || !response.data) {
    return null;
  }

  return mapApiUserToUser(response.data);
}

/**
 * 이메일/비밀번호로 로그인합니다.
 *
 * Result 타입을 사용하여 성공/실패를 명확히 구분합니다.
 * - 성공: { success: true, data: User }
 * - 실패: { success: false, error: Error }
 */
export async function login(
  email: string,
  password: string,
): Promise<Result<User>> {
  const response = await api.auth.login(email, password);

  if (response.error || !response.data?.user) {
    const error = toError(response.error ?? "Login failed");
    return failure(error);
  }

  return success(mapApiUserToUser(response.data.user));
}

/**
 * 로그아웃합니다.
 */
export async function logout(): Promise<void> {
  await api.auth.logout();
}

/**
 * 새 계정을 생성합니다.
 *
 * Result 타입을 사용하여 성공/실패를 명확히 구분합니다.
 * - 성공: { success: true, data: User }
 * - 실패: { success: false, error: Error }
 */
export async function signup(
  email: string,
  password: string,
  name: string,
): Promise<Result<User>> {
  const response = await api.auth.signup(email, password, name);

  if (response.error || !response.data?.user) {
    const error = toError(response.error ?? "Signup failed");
    return failure(error);
  }

  return success(mapApiUserToUser(response.data.user));
}
