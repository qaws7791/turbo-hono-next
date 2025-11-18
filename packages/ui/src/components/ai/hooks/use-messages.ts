/**
 * 메시지 조회 훅
 *
 * 이 훅은 UI 레이어에서 타입 정의만 제공합니다.
 * 실제 구현은 앱 레이어(apps/web)에서 TanStack Query를 사용하여 이루어집니다.
 */

import type { Message } from "../types";

/**
 * 메시지 조회 훅의 반환 타입
 */
export interface UseMessagesResult {
  /**
   * 메시지 목록
   */
  messages: Array<Message>;

  /**
   * 로딩 상태
   */
  isLoading: boolean;

  /**
   * 에러 객체
   */
  error: Error | null;

  /**
   * 데이터 새로고침
   */
  refetch: () => Promise<void>;
}

/**
 * 메시지 조회 훅의 타입 정의
 *
 * 실제 구현 예시:
 * ```typescript
 * // apps/web/src/features/ai-chat/hooks/use-messages.ts
 * export function useMessages(conversationId: string | null): UseMessagesResult {
 *   const { data, isLoading, error, refetch } = useQuery({
 *     queryKey: ['messages', conversationId],
 *     queryFn: () => conversationId
 *       ? apiClient.getMessages(conversationId)
 *       : Promise.resolve({ messages: [] }),
 *     enabled: !!conversationId,
 *   });
 *
 *   return {
 *     messages: data?.messages || [],
 *     isLoading,
 *     error,
 *     refetch,
 *   };
 * }
 * ```
 */
export type UseMessages = (conversationId: string | null) => UseMessagesResult;
