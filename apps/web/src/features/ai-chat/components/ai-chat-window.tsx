/**
 * 채팅 영역 컴포넌트
 */

import { useState } from "react";
import {
  BulkUpdateTasksResult,
  CompleteTasksResult,
  CreateModuleResult,
  CreateTaskResult,
  DeleteModuleResult,
  DeleteTaskResult,
  GetModuleDetailsResult,
  GetPlanDetailsResult,
  GetProgressResult,
  ListModulesResult,
  ListTasksResult,
  ToolExecutionCard,
  UpdateModuleResult,
  UpdateTaskResult,
  extractToolName,
  isToolPart,
} from "@repo/ui/ai";

import { useAIChat } from "../hooks/use-ai-chat";

import type { FormEvent, ReactNode } from "react";
import type {
  BulkUpdateTasksOutput,
  CompleteTasksOutput,
  CreateModuleOutput,
  CreateTaskOutput,
  DeleteModuleOutput,
  DeleteTaskOutput,
  GetModuleDetailsOutput,
  GetPlanDetailsOutput,
  GetProgressOutput,
  ListModulesOutput,
  ListTasksOutput,
  UpdateModuleOutput,
  UpdateTaskOutput,
} from "@repo/ai-types";
import type { ToolPart } from "@repo/ui/ai";

interface AIChatWindowProps {
  conversationId: string;
  learningPlanId: string;
}

/**
 * Tool part 렌더링 헬퍼 함수
 */
function renderToolPart(part: ToolPart, partIndex: number): ReactNode {
  const toolName = extractToolName(part.type);

  // 실행 중 상태 공통 처리
  if (part.state === "input-streaming" || part.state === "input-available") {
    return (
      <ToolExecutionCard
        key={partIndex}
        toolName={toolName}
        state={part.state}
      >
        <p className="text-gray-600">실행 중...</p>
      </ToolExecutionCard>
    );
  }

  // 에러 상태 공통 처리
  if (part.state === "output-error") {
    return (
      <ToolExecutionCard
        key={partIndex}
        toolName={toolName}
        state={part.state}
      >
        <p className="text-red-700">
          에러: {part.errorText || "알 수 없는 오류"}
        </p>
      </ToolExecutionCard>
    );
  }

  // 결과 상태 - Tool별 커스텀 렌더링
  if (part.state === "output-available" && part.result) {
    return (
      <ToolExecutionCard
        key={partIndex}
        toolName={toolName}
        state={part.state}
      >
        {renderToolResult(toolName, part.result)}
      </ToolExecutionCard>
    );
  }

  return null;
}

/**
 * Tool 결과 렌더링 (Tool 타입별 분기)
 */
function renderToolResult(toolName: string, result: unknown): ReactNode {
  switch (toolName) {
    case "createModule":
      return <CreateModuleResult result={result as CreateModuleOutput} />;
    case "updateModule":
      return <UpdateModuleResult result={result as UpdateModuleOutput} />;
    case "deleteModule":
      return <DeleteModuleResult result={result as DeleteModuleOutput} />;
    case "listModules":
      return <ListModulesResult result={result as ListModulesOutput} />;

    case "createTask":
      return <CreateTaskResult result={result as CreateTaskOutput} />;
    case "updateTask":
      return <UpdateTaskResult result={result as UpdateTaskOutput} />;
    case "deleteTask":
      return <DeleteTaskResult result={result as DeleteTaskOutput} />;
    case "completeTasks":
      return <CompleteTasksResult result={result as CompleteTasksOutput} />;
    case "listTasks":
      return <ListTasksResult result={result as ListTasksOutput} />;
    case "bulkUpdateTasks":
      return <BulkUpdateTasksResult result={result as BulkUpdateTasksOutput} />;

    case "getProgress":
      return <GetProgressResult result={result as GetProgressOutput} />;
    case "getPlanDetails":
      return <GetPlanDetailsResult result={result as GetPlanDetailsOutput} />;
    case "getModuleDetails":
      return (
        <GetModuleDetailsResult result={result as GetModuleDetailsOutput} />
      );

    default:
      return (
        <div className="text-sm text-gray-600">
          <p>Tool: {toolName}</p>
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      );
  }
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

                  default: {
                    // Tool parts 처리 (AI SDK v5)
                    if (isToolPart(part)) {
                      return renderToolPart(part, partIndex);
                    }
                    return null;
                  }
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
