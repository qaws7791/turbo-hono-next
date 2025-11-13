/**
 * 메시지 조회 훅
 */

import { useQuery } from "@tanstack/react-query";

import type { UseMessagesResult } from "@repo/ui/ai";

import { api } from "@/api/http-client";

/**
 * 대화 세션의 메시지 목록 조회 훅
 *
 * @param conversationId - 대화 세션 ID (null이면 빈 배열 반환)
 * @returns 메시지 목록 및 로딩 상태
 */
export function useMessages(conversationId: string | null): UseMessagesResult {
  const {
    data,
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) {
        return { messages: [], totalCount: 0 };
      }

      const response = await api.aiChat.getMessages(conversationId);

      if (response.error) {
        throw new Error(
          (response.error as { error: { message: string } }).error.message ||
            "메시지 조회 실패",
        );
      }

      return response.data;
    },
    enabled: !!conversationId,
  });

  // refetch 함수 래핑
  const refetch = async () => {
    await refetchQuery();
  };

  return {
    messages: data?.messages || [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
