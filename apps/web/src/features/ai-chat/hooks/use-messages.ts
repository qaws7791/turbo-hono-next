/**
 * 메시지 조회 훅
 */

import { useQuery } from "@tanstack/react-query";

import { messagesQueryOptions } from "@/features/ai-chat/api/queries";

/**
 * 대화 세션의 메시지 목록 조회 훅
 *
 * @param conversationId - 대화 세션 ID (null이면 빈 배열 반환)
 * @returns 메시지 목록 및 로딩 상태
 */
export function useMessages(conversationId: string | null) {
  const {
    data,
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery(messagesQueryOptions(conversationId));

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
