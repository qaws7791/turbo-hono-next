import { MessageInput } from "@repo/ui/ai";
import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * MessageInput component for entering chat messages
 *
 * Features:
 * - Auto-resize textarea
 * - Enter to send, Shift+Enter for newline
 * - Character count display
 * - Max length validation
 * - Disabled state
 */
const meta = {
  title: "AI/MessageInput",
  component: MessageInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MessageInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default message input
 */
export const Default: Story = {
  args: {
    onSend: (message: string) => console.log("Sent:", message),
    placeholder: "메시지를 입력하세요...",
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    onSend: (message: string) => console.log("Sent:", message),
    disabled: true,
    placeholder: "AI가 응답하는 중입니다...",
  },
};

/**
 * Custom placeholder
 */
export const CustomPlaceholder: Story = {
  args: {
    onSend: (message: string) => console.log("Sent:", message),
    placeholder: "AI 튜터에게 질문하세요...",
  },
};

/**
 * With shorter max length
 */
export const ShortMaxLength: Story = {
  args: {
    onSend: (message: string) => console.log("Sent:", message),
    maxLength: 100,
  },
};

/**
 * Interactive example with state
 */
export const Interactive: Story = {
  render: () => {
    const [messages, setMessages] = useState<Array<string>>([]);

    return (
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">
              전송된 메시지가 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className="bg-blue-100 rounded-lg px-3 py-2"
                >
                  {msg}
                </div>
              ))}
            </div>
          )}
        </div>

        <MessageInput
          onSend={(message) => {
            setMessages((prev) => [...prev, message]);
          }}
          placeholder="메시지를 입력하고 Enter를 누르세요"
        />
      </div>
    );
  },
};

/**
 * Simulated streaming state
 */
export const Streaming: Story = {
  render: () => {
    const [isStreaming, setIsStreaming] = useState(false);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsStreaming(!isStreaming)}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            {isStreaming ? "스트리밍 중지" : "스트리밍 시작"}
          </button>
          <span className="text-sm text-gray-600">
            상태: {isStreaming ? "스트리밍 중" : "대기 중"}
          </span>
        </div>

        <MessageInput
          onSend={(message) => console.log("Sent:", message)}
          disabled={isStreaming}
          placeholder={
            isStreaming ? "AI가 응답하는 중입니다..." : "메시지를 입력하세요..."
          }
        />
      </div>
    );
  },
};
