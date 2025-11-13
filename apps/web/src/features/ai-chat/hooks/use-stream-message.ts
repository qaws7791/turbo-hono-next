/**
 * 스트리밍 메시지 전송 훅
 */

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type {
  SendMessageParams,
  StreamEventHandlers,
  UseStreamMessageResult,
} from "@repo/ui/ai";

import { api } from "@/api/http-client";

/**
 * AI 메시지 스트리밍 전송 훅
 *
 * SSE를 사용하여 실시간으로 AI 응답을 받습니다.
 *
 * @returns 스트리밍 전송 인터페이스
 */
export function useStreamMessage(): UseStreamMessageResult {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  /**
   * 메시지 전송 및 스트리밍 응답 처리
   */
  const sendMessage = useCallback(
    async (params: SendMessageParams, handlers?: StreamEventHandlers) => {
      setIsStreaming(true);
      setError(null);

      // Abort controller 생성
      abortControllerRef.current = new AbortController();

      try {
        const response = await api.aiChat.streamMessage({
          conversationId: params.conversationId,
          learningPlanId: params.learningPlanId,
          message: params.message,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "메시지 전송 실패");
        }

        // SSE 스트림 읽기
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("응답 스트림을 읽을 수 없습니다");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // 청크 디코딩
          buffer += decoder.decode(value, { stream: true });

          // SSE 이벤트 파싱 (줄바꿈으로 구분)
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // 마지막 불완전한 줄은 버퍼에 보관

          for (const line of lines) {
            if (!line.trim() || line.startsWith(":")) {
              continue; // 빈 줄이나 주석 무시
            }

            // SSE 형식: "data: {...}"
            if (line.startsWith("data: ")) {
              const data = line.slice(6); // "data: " 제거

              // [DONE] 시그널 체크
              if (data === "[DONE]") {
                handlers?.onComplete?.();
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                // 텍스트 청크 처리
                if (parsed.type === "text-delta" && parsed.textDelta) {
                  handlers?.onTextChunk?.(parsed.textDelta);
                }

                // Tool 호출 처리
                if (parsed.type === "tool-call" && parsed.toolCall) {
                  handlers?.onToolCall?.(
                    parsed.toolCall.toolName,
                    parsed.toolCall.args,
                  );
                }

                // Tool 결과 처리
                if (parsed.type === "tool-result" && parsed.toolResult) {
                  handlers?.onToolResult?.(
                    parsed.toolResult.toolName,
                    parsed.toolResult.result,
                  );
                }
              } catch (parseError) {
                console.warn("SSE 파싱 에러:", parseError, data);
              }
            }
          }
        }

        // 스트리밍 완료 후 메시지 목록 새로고침
        if (params.conversationId) {
          await queryClient.invalidateQueries({
            queryKey: ["messages", params.conversationId],
          });
        }

        // 대화 세션 목록도 업데이트 (updatedAt 변경)
        await queryClient.invalidateQueries({
          queryKey: ["conversations", params.learningPlanId],
        });

        // 학습 계획 상세 정보도 업데이트 (Tool이 변경했을 수 있음)
        await queryClient.invalidateQueries({
          queryKey: ["learningPlan", params.learningPlanId],
        });

        handlers?.onComplete?.();
      } catch (err) {
        const streamError = err as Error;
        setError(streamError);
        handlers?.onError?.(streamError);
        console.error("스트림 메시지 에러:", streamError);
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [queryClient],
  );

  /**
   * 스트리밍 중단
   */
  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    sendMessage,
    isStreaming,
    error,
    abort,
  };
}
