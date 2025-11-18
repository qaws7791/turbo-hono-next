/**
 * AI Chat 쿼리 옵션 정의
 *
 * TanStack Query의 queryOptions를 사용하여 타입 안전한 쿼리를 정의합니다.
 *
 * NOTE: Return types are intentionally omitted to allow TypeScript to infer
 * the precise types from queryOptions, which includes specific tuple types
 * for queryKey that cannot be accurately represented with explicit type annotations.
 */

import { queryOptions } from "@tanstack/react-query";

import { aiChatKeys } from "./query-keys";

import { api } from "@/api/http-client";

/**
 * 대화 세션 목록 조회 쿼리 옵션
 * @param learningPlanId - 학습 계획 ID
 */
export const conversationsQueryOptions = (learningPlanId: string) =>
  queryOptions({
    queryKey: aiChatKeys.conversationsList(learningPlanId),
    queryFn: async () => {
      const response = await api.aiChat.getConversations(learningPlanId);

      if (response.error) {
        throw new Error(
          (response.error as { error: { message: string } }).error.message ||
            "대화 세션 조회 실패",
        );
      }

      return response.data;
    },
    enabled: !!learningPlanId,
  });

/**
 * 메시지 목록 조회 쿼리 옵션
 * @param conversationId - 대화 세션 ID (null이면 빈 배열 반환)
 */
export const messagesQueryOptions = (conversationId: string | null) =>
  queryOptions({
    queryKey: aiChatKeys.messagesList(conversationId),
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
