/**
 * 메시지 입력 컴포넌트
 */

import React, { useRef, useState } from "react";

import { Button } from "../button";

import type { KeyboardEvent } from "react";

export interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

/**
 * 메시지 입력창 컴포넌트
 * Enter 키로 전송, Shift+Enter로 줄바꿈
 */
export function MessageInput({
  onSend,
  disabled = false,
  placeholder = "메시지를 입력하세요...",
  maxLength = 5000,
  className = "",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage("");

      // textarea 높이 초기화
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 키만 누르면 전송, Shift+Enter는 줄바꿈
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // 자동 높이 조절 (최대 5줄)
    const textarea = e.target;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 120); // 약 5줄
    textarea.style.height = `${newHeight}px`;
  };

  return (
    <div
      className={`border-t border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      <div className="flex items-end gap-2">
        {/* 메시지 입력창 */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600
                   bg-white dark:bg-gray-800 px-4 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                   disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
                   placeholder:text-gray-400 dark:placeholder:text-gray-500"
          style={{ minHeight: "40px", maxHeight: "120px" }}
        />

        {/* 전송 버튼 */}
        <Button
          onPress={handleSend}
          isDisabled={disabled || !message.trim()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600
                   text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
        >
          전송
        </Button>
      </div>

      {/* 글자 수 표시 */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">
        {message.length} / {maxLength}
      </div>
    </div>
  );
}
