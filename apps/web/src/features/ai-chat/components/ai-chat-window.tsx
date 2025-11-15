/**
 * 채팅 영역 컴포넌트
 */

import { useState } from "react";

import { useAIChat } from "../hooks/use-ai-chat";

import type { FormEvent } from "react";

interface AIChatWindowProps {
  conversationId: string;
  learningPlanId: string;
}

/**
 * 선택된 대화에 대한 채팅 UI
 */
export function AIChatWindow({
  conversationId,
  learningPlanId,
}: AIChatWindowProps) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useAIChat({
    conversationId,
    learningPlanId,
  });

  const isLoading = status === "streaming";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage({ text: input });
    setInput("");
  };

  return (
    <>
      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            메시지를 입력하여 대화를 시작하세요
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id}>
              {msg.parts.map((part, partIndex) => {
                switch (part.type) {
                  case "text":
                    return (
                      <div
                        key={partIndex}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            msg.role === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {part.text}
                          </p>
                        </div>
                      </div>
                    );

                  case "step-start":
                    return partIndex > 0 ? (
                      <div
                        key={partIndex}
                        className="text-gray-500"
                      >
                        <hr className="my-2 border-gray-300" />
                      </div>
                    ) : null;

                  // 동적 도구 처리
                  case "dynamic-tool":
                    return (
                      <div
                        key={partIndex}
                        className="flex justify-start"
                      >
                        <div className="max-w-[70%] rounded-lg px-4 py-2 bg-gray-50 border border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-1">
                            도구: {part.toolName}
                          </p>
                          {part.state === "input-streaming" && (
                            <p className="text-xs text-gray-500">실행 중...</p>
                          )}
                          {part.state === "input-available" && (
                            <p className="text-xs text-gray-500">
                              입력 준비 완료
                            </p>
                          )}
                          {part.state === "output-available" && (
                            <p className="text-xs text-gray-600">완료</p>
                          )}
                          {part.state === "output-error" && (
                            <p className="text-xs text-red-600">
                              에러: {part.errorText}
                            </p>
                          )}
                        </div>
                      </div>
                    );

                  default:
                    return null;
                }
              })}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <p className="text-sm text-gray-500">AI가 응답 중...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-600 rounded-lg px-4 py-2 text-sm">
              에러: {error.message}
            </div>
          </div>
        )}
      </div>

      {/* 입력 폼 */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 p-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "전송 중..." : "전송"}
          </button>
        </div>
      </form>
    </>
  );
}
