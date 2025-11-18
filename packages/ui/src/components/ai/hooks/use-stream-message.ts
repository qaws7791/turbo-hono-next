/**
 * 스트리밍 메시지 전송 훅
 *
 * 이 훅은 UI 레이어에서 타입 정의만 제공합니다.
 * 실제 구현은 앱 레이어(apps/web)에서 fetch + ReadableStream을 사용하여 이루어집니다.
 */

/**
 * 메시지 전송 파라미터
 */
export interface SendMessageParams {
  /**
   * 대화 세션 ID (없으면 새 세션 생성)
   */
  conversationId?: string;

  /**
   * 학습 계획 ID
   */
  learningPlanId: string;

  /**
   * 메시지 내용
   */
  message: string;
}

/**
 * 스트리밍 응답 이벤트 핸들러
 */
export interface StreamEventHandlers {
  /**
   * 텍스트 청크 수신 시 호출
   */
  onTextChunk?: (chunk: string) => void;

  /**
   * Tool 호출 시작 시 호출
   */
  onToolCall?: (toolName: string, args: Record<string, unknown>) => void;

  /**
   * Tool 실행 결과 수신 시 호출
   */
  onToolResult?: (toolName: string, result: unknown) => void;

  /**
   * 스트리밍 완료 시 호출
   */
  onComplete?: () => void;

  /**
   * 에러 발생 시 호출
   */
  onError?: (error: Error) => void;
}

/**
 * 스트리밍 메시지 전송 훅의 반환 타입
 */
export interface UseStreamMessageResult {
  /**
   * 메시지 전송 함수
   */
  sendMessage: (
    params: SendMessageParams,
    handlers?: StreamEventHandlers,
  ) => Promise<void>;

  /**
   * 스트리밍 진행 중 여부
   */
  isStreaming: boolean;

  /**
   * 에러 객체
   */
  error: Error | null;

  /**
   * 스트리밍 중단
   */
  abort: () => void;
}

/**
 * 스트리밍 메시지 전송 훅의 타입 정의
 *
 * 실제 구현 예시:
 * ```typescript
 * // apps/web/src/features/ai-chat/hooks/use-stream-message.ts
 * export function useStreamMessage(): UseStreamMessageResult {
 *   const [isStreaming, setIsStreaming] = useState(false);
 *   const [error, setError] = useState<Error | null>(null);
 *   const abortControllerRef = useRef<AbortController | null>(null);
 *
 *   const sendMessage = useCallback(
 *     async (params: SendMessageParams, handlers?: StreamEventHandlers) => {
 *       setIsStreaming(true);
 *       setError(null);
 *
 *       abortControllerRef.current = new AbortController();
 *
 *       try {
 *         const response = await fetch('/api/chat/stream', {
 *           method: 'POST',
 *           headers: { 'Content-Type': 'application/json' },
 *           body: JSON.stringify(params),
 *           signal: abortControllerRef.current.signal,
 *         });
 *
 *         if (!response.ok) throw new Error('Failed to send message');
 *
 *         const reader = response.body?.getReader();
 *         const decoder = new TextDecoder();
 *
 *         while (true) {
 *           const { done, value } = await reader!.read();
 *           if (done) break;
 *
 *           const chunk = decoder.decode(value);
 *           // SSE 스트림 파싱 및 핸들러 호출
 *           handlers?.onTextChunk?.(chunk);
 *         }
 *
 *         handlers?.onComplete?.();
 *       } catch (err) {
 *         const error = err as Error;
 *         setError(error);
 *         handlers?.onError?.(error);
 *       } finally {
 *         setIsStreaming(false);
 *         abortControllerRef.current = null;
 *       }
 *     },
 *     [],
 *   );
 *
 *   const abort = useCallback(() => {
 *     abortControllerRef.current?.abort();
 *   }, []);
 *
 *   return { sendMessage, isStreaming, error, abort };
 * }
 * ```
 */
export type UseStreamMessage = () => UseStreamMessageResult;
