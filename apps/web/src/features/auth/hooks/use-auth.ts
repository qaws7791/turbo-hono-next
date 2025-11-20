import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import type { AuthUser } from "@/features/auth/types";

import { authKeys, authMeQueryOptions } from "@/features/auth/api/auth-queries";
import {
  login as loginService,
  logout as logoutService,
  signup as signupService,
} from "@/features/auth/api/auth-service";

/**
 * 인증 상태 및 동작을 관리하는 hook
 *
 * React Query를 사용하여 서버 상태를 관리합니다.
 * - useQuery: 현재 사용자 정보 조회
 * - useMutation: login, logout, signup (Result 타입 처리)
 *
 * 이전 AuthContext의 기능을 모두 제공하되,
 * React Query의 장점(캐싱, 자동 refetch)을 활용합니다.
 */
export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery(authMeQueryOptions());

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginService(email, password),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.setQueryData(authKeys.me(), result.data);
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutService,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me(), null);
    },
  });

  const signupMutation = useMutation({
    mutationFn: ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    }) => signupService(email, password, name),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.setQueryData(authKeys.me(), result.data);
      }
    },
  });

  const login = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      const result = await loginMutation.mutateAsync({ email, password });
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    [loginMutation],
  );

  const logout = useCallback(async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string,
    ): Promise<AuthUser> => {
      const result = await signupMutation.mutateAsync({
        email,
        password,
        name,
      });
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    [signupMutation],
  );

  const authState = useMemo(
    () => ({
      isAuthenticated: user !== null && user !== undefined,
      isLoading,
      user: user ?? null,
      login,
      logout,
      signup,
    }),
    [isLoading, login, logout, signup, user],
  );

  return authState;
}

export type AuthState = ReturnType<typeof useAuth>;
