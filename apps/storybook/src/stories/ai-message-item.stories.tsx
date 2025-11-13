import { MessageItem } from "@repo/ui/ai";

import type { Message } from "@repo/ui/ai";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * MessageItem component displays individual chat messages
 *
 * Features:
 * - User/Assistant/Tool message types
 * - Tool invocation display
 * - Timestamp display
 * - Responsive layout
 */
const meta = {
  title: "AI/MessageItem",
  component: MessageItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MessageItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const userMessage: Message = {
  id: "1",
  conversationId: "conv1",
  role: "user",
  content: "React Hooks 모듈을 추가해줘",
  createdAt: new Date().toISOString(),
};

const assistantMessage: Message = {
  id: "2",
  conversationId: "conv1",
  role: "assistant",
  content:
    "React Hooks 모듈을 추가했습니다. 이 모듈에서는 useState, useEffect, useContext 등의 핵심 훅들을 학습하게 됩니다.",
  createdAt: new Date().toISOString(),
};

const messageWithTool: Message = {
  id: "3",
  conversationId: "conv1",
  role: "assistant",
  content: "React Hooks 모듈을 생성했습니다.",
  toolInvocations: [
    {
      toolCallId: "tool1",
      toolName: "createModule",
      args: {
        learningPlanId: "plan1",
        title: "React Hooks",
        description: "React Hooks 핵심 개념 학습",
      },
      result: {
        success: true,
        moduleId: "module1",
        message: "React Hooks 모듈을 생성했습니다.",
      },
      state: "result",
    },
  ],
  createdAt: new Date().toISOString(),
};

/**
 * User message example
 */
export const UserMessage: Story = {
  args: {
    message: userMessage,
  },
};

/**
 * Assistant message example
 */
export const AssistantMessage: Story = {
  args: {
    message: assistantMessage,
  },
};

/**
 * Message with tool invocation
 */
export const MessageWithTool: Story = {
  args: {
    message: messageWithTool,
  },
};

/**
 * Long message example
 */
export const LongMessage: Story = {
  args: {
    message: {
      ...assistantMessage,
      content: `React Hooks는 React 16.8에서 도입된 기능으로, 함수 컴포넌트에서 상태와 생명주기 기능을 사용할 수 있게 해줍니다.

주요 Hooks:
1. useState - 상태 관리
2. useEffect - 사이드 이펙트 처리
3. useContext - 컨텍스트 사용
4. useReducer - 복잡한 상태 로직
5. useCallback - 메모이제이션
6. useMemo - 값 메모이제이션
7. useRef - 참조 저장

이러한 Hooks를 활용하면 클래스 컴포넌트 없이도 강력한 기능을 구현할 수 있습니다.`,
    },
  },
};

/**
 * Multiple tool invocations
 */
export const MultipleToolInvocations: Story = {
  args: {
    message: {
      ...messageWithTool,
      toolInvocations: [
        {
          toolCallId: "tool1",
          toolName: "createModule",
          args: { title: "React Hooks" },
          result: { success: true },
          state: "result",
        },
        {
          toolCallId: "tool2",
          toolName: "createTask",
          args: { title: "useState 학습" },
          result: { success: true },
          state: "result",
        },
      ],
    },
  },
};

/**
 * Tool in progress
 */
export const ToolInProgress: Story = {
  args: {
    message: {
      ...messageWithTool,
      content: "모듈을 생성하고 있습니다...",
      toolInvocations: [
        {
          toolCallId: "tool1",
          toolName: "createModule",
          args: { title: "React Hooks" },
          state: "call",
        },
      ],
    },
  },
};

/**
 * Conversation view with multiple messages
 */
export const ConversationView: Story = {
  render: () => (
    <div className="w-[600px] space-y-4 p-4">
      <MessageItem message={userMessage} />
      <MessageItem message={assistantMessage} />
      <MessageItem
        message={{
          ...userMessage,
          id: "3",
          content: "각 훅에 대한 실습 과제도 추가해줘",
        }}
      />
      <MessageItem message={messageWithTool} />
    </div>
  ),
};
