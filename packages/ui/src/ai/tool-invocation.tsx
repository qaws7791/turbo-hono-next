/**
 * Tool 호출 표시 컴포넌트
 */

import React, { useState } from "react";

import type { ToolInvocation as ToolInvocationType } from "./types";

export interface ToolInvocationProps {
  invocation: ToolInvocationType;
  className?: string;
}

/**
 * Tool 호출 정보를 표시하는 컴포넌트
 */
export function ToolInvocation({
  invocation,
  className = "",
}: ToolInvocationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toolNameDisplay = invocation.toolName.replace(/([A-Z])/g, " $1").trim();

  return (
    <div
      className={`border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-800 ${className}`}
    >
      {/* Tool 이름과 상태 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            🛠️ {toolNameDisplay}
          </span>
          {invocation.state === "call" && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400">
              실행 중...
            </span>
          )}
          {invocation.state === "result" && (
            <span className="text-xs text-green-600 dark:text-green-400">
              완료
            </span>
          )}
        </div>

        {/* 상세 정보 토글 버튼 */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {isExpanded ? "접기" : "상세"}
        </button>
      </div>

      {/* 상세 정보 (펼쳤을 때) */}
      {isExpanded && (
        <div className="mt-3 space-y-2">
          {/* 파라미터 */}
          <div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              파라미터:
            </div>
            <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
              {JSON.stringify(invocation.args, null, 2)}
            </pre>
          </div>

          {/* 결과 */}
          {invocation.result !== undefined && (
            <div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                결과:
              </div>
              <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                {typeof invocation.result === "string"
                  ? invocation.result
                  : JSON.stringify(invocation.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
