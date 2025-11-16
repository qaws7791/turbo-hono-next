/**
 * Tool 실행 카드 공통 컴포넌트
 */

import type { ReactNode } from "react";
import type { ToolPartState } from "./utils";

interface ToolExecutionCardProps {
  toolName: string;
  state: ToolPartState;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Tool 실행 상태를 표시하는 기본 카드 컴포넌트
 */
export function ToolExecutionCard({
  toolName,
  state,
  icon,
  children,
}: ToolExecutionCardProps) {
  const getStateStyles = () => {
    switch (state) {
      case "input-streaming":
      case "input-available":
        return "bg-blue-50 border-blue-200";
      case "output-available":
        return "bg-gray-50 border-gray-200";
      case "output-error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case "input-streaming":
        return (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        );
      case "output-available":
        return (
          <svg
            className="w-4 h-4 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "output-error":
        return (
          <svg
            className="w-4 h-4 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return icon;
    }
  };

  return (
    <div className="flex justify-start">
      <div
        className={`max-w-[70%] rounded-lg px-4 py-3 border ${getStateStyles()}`}
      >
        <div className="flex items-center gap-2 mb-2">
          {getStateIcon()}
          <p className="text-xs font-semibold text-gray-700">
            {getToolDisplayName(toolName)}
          </p>
        </div>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

/**
 * Tool 이름을 사용자 친화적인 형식으로 변환
 */
function getToolDisplayName(toolName: string): string {
  const displayNames: Record<string, string> = {
    createModule: "모듈 생성",
    updateModule: "모듈 수정",
    deleteModule: "모듈 삭제",
    listModules: "모듈 목록 조회",
    createTask: "태스크 생성",
    updateTask: "태스크 수정",
    deleteTask: "태스크 삭제",
    completeTasks: "태스크 완료",
    listTasks: "태스크 목록 조회",
    bulkUpdateTasks: "태스크 일괄 수정",
    getProgress: "진행률 조회",
    getPlanDetails: "학습 계획 조회",
    getModuleDetails: "모듈 상세 조회",
  };

  return displayNames[toolName] || toolName;
}
