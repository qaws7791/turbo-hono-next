/**
 * AI 채팅 훅 (AI SDK v5 useChat 기반)
 */

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";

import type { AppUIMessage } from "@repo/ai-types";

interface UseAIChatProps {
  conversationId: string;
  learningPlanId: string;
}

/**
 * AI 채팅 훅
 * AI SDK v5의 useChat 훅을 사용하여 스트리밍 채팅 구현
 */
export function useAIChat({ conversationId, learningPlanId }: UseAIChatProps) {
  const queryClient = useQueryClient();
  console.log("useAIChat conversationId:", conversationId);
  const chat = useChat<AppUIMessage>({
    transport: new DefaultChatTransport({
      api: "http://localhost:3001/chat/stream",
      credentials: "include",
      body: {
        a: "b",
        conversationId: conversationId ?? undefined,
        learningPlanId,
      },
    }),
    onFinish: () => {
      // 스트리밍 완료 후 쿼리 무효화
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: ["messages", conversationId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["conversations", learningPlanId],
      });
      queryClient.invalidateQueries({
        queryKey: ["learningPlan", learningPlanId],
      });
    },
    onError: (error: Error) => {
      console.error("AI 채팅 에러:", error);
    },
  });

  return chat;
}
