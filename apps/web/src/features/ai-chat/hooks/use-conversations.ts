/**
 * 대화 세션 관리 훅
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api/http-client";
import { conversationsQueryOptions } from "@/features/ai-chat/api/queries";
import { aiChatKeys } from "@/features/ai-chat/api/query-keys";

/**
 * 대화 세션 목록 조회 및 관리 훅
 *
 * @param learningPlanId - 학습 계획 ID
 * @returns 대화 세션 관리 인터페이스
 */
export function useConversations(learningPlanId: string) {
  const queryClient = useQueryClient();

  // 대화 세션 목록 조회
  const {
    data,
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery(conversationsQueryOptions(learningPlanId));

  // 대화 세션 생성 mutation
  const createMutation = useMutation({
    mutationFn: async (params: { learningPlanId: string; title?: string }) => {
      const response = await api.aiChat.createConversation(params);

      if (response.error) {
        throw new Error(
          (response.error as { error: { message: string } }).error.message ||
            "대화 세션 생성 실패",
        );
      }

      return response.data;
    },
    onSuccess: () => {
      // 대화 세션 목록 새로고침
      queryClient.invalidateQueries({
        queryKey: aiChatKeys.conversationsList(learningPlanId),
      });
    },
  });

  // 대화 세션 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await api.aiChat.deleteConversation(conversationId);

      if (response.error) {
        throw new Error(
          (response.error as { error: { message: string } }).error.message ||
            "대화 세션 삭제 실패",
        );
      }
    },
    onSuccess: () => {
      // 대화 세션 목록 새로고침
      queryClient.invalidateQueries({
        queryKey: aiChatKeys.conversationsList(learningPlanId),
      });
    },
  });

  // refetch 함수 래핑
  const refetch = async () => {
    await refetchQuery();
  };

  return {
    conversations: data?.conversations || [],
    isLoading,
    error: error as Error | null,
    createConversation: createMutation.mutateAsync,
    deleteConversation: deleteMutation.mutateAsync,
    refetch,
  };
}
