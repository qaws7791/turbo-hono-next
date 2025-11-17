/**
 * AI Chat 쿼리 키 팩토리
 *
 * TanStack Query의 모든 쿼리 키를 중앙에서 관리합니다.
 * 캐시 무효화 및 쿼리 키 일관성 유지를 위한 단일 진실 공급원(Single Source of Truth)입니다.
 */

export const aiChatKeys = {
  /** AI Chat 루트 스코프 */
  root: ["aiChat"] as const,

  /** 대화 세션 스코프 */
  conversations: () => [...aiChatKeys.root, "conversations"] as const,

  /**
   * 특정 학습 계획의 대화 세션 목록
   * @param learningPlanId - 학습 계획 ID
   */
  conversationsList: (learningPlanId: string) =>
    [...aiChatKeys.conversations(), "list", learningPlanId] as const,

  /**
   * 특정 대화 세션 상세
   * @param conversationId - 대화 세션 ID
   */
  conversationDetail: (conversationId: string) =>
    [...aiChatKeys.conversations(), "detail", conversationId] as const,

  /** 메시지 스코프 */
  messages: () => [...aiChatKeys.root, "messages"] as const,

  /**
   * 특정 대화 세션의 메시지 목록
   * @param conversationId - 대화 세션 ID
   */
  messagesList: (conversationId: string | null) =>
    [...aiChatKeys.messages(), "list", conversationId] as const,
};
