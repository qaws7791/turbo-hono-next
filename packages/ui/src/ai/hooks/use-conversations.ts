/**
 * 대화 세션 관리 훅
 *
 * 이 훅은 UI 레이어에서 타입 정의만 제공합니다.
 * 실제 구현은 앱 레이어(apps/web)에서 TanStack Query를 사용하여 이루어집니다.
 */

import type { Conversation } from "../types";

/**
 * 대화 세션 관리 훅의 반환 타입
 */
export interface UseConversationsResult {
  /**
   * 대화 세션 목록
   */
  conversations: Array<Conversation>;

  /**
   * 로딩 상태
   */
  isLoading: boolean;

  /**
   * 에러 객체
   */
  error: Error | null;

  /**
   * 새 대화 세션 생성
   */
  createConversation: (
    learningPlanId: string,
    title?: string,
  ) => Promise<Conversation>;

  /**
   * 대화 세션 삭제
   */
  deleteConversation: (conversationId: string) => Promise<void>;

  /**
   * 데이터 새로고침
   */
  refetch: () => Promise<void>;
}

/**
 * 대화 세션 관리 훅의 타입 정의
 *
 * 실제 구현 예시:
 * ```typescript
 * // apps/web/src/features/ai-chat/hooks/use-conversations.ts
 * export function useConversations(learningPlanId: string): UseConversationsResult {
 *   const { data, isLoading, error, refetch } = useQuery({
 *     queryKey: ['conversations', learningPlanId],
 *     queryFn: () => apiClient.getConversations(learningPlanId),
 *   });
 *
 *   const createMutation = useMutation({
 *     mutationFn: (data: { learningPlanId: string; title?: string }) =>
 *       apiClient.createConversation(data),
 *     onSuccess: () => refetch(),
 *   });
 *
 *   return {
 *     conversations: data?.conversations || [],
 *     isLoading,
 *     error,
 *     createConversation: createMutation.mutateAsync,
 *     deleteConversation: async (id) => { ... },
 *     refetch,
 *   };
 * }
 * ```
 */
export type UseConversations = (
  learningPlanId: string,
) => UseConversationsResult;
