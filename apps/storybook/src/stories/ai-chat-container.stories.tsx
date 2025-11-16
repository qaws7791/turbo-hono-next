import { ChatContainer } from "@repo/ui/ai";
import { useState } from "react";

import type { Message } from "@repo/ui/ai";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * ChatContainer component - complete chat interface
 *
 * Features:
 * - Message list with auto-scroll
 * - Message input with validation
 * - Loading and streaming states
 * - Header with context info
 */
const meta = {
  title: "AI/ChatContainer",
  component: ChatContainer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="h-[600px] w-[700px] border border-gray-200 rounded-lg overflow-hidden">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMessages: Array<Message> = [
  {
    id: "1",
    conversationId: "conv1",
    role: "user",
    parts: [{ type: "text", text: "React를 학습하고 싶어요" }],
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "2",
    conversationId: "conv1",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "React 학습을 시작하시는군요! 기본적인 학습 계획을 세워드리겠습니다.",
      },
    ],
    createdAt: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: "3",
    conversationId: "conv1",
    role: "user",
    parts: [{ type: "text", text: "React Hooks 모듈을 추가해줘" }],
    createdAt: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: "4",
    conversationId: "conv1",
    role: "assistant",
    parts: [
      { type: "text", text: "React Hooks 모듈을 추가했습니다." },
      {
        type: "tool-createModule",
        toolCallId: "tool1",
        state: "result",
        input: {
          learningPlanId: "plan1",
          title: "React Hooks",
          description: "React Hooks 핵심 개념",
        },
        result: {
          success: true,
          moduleId: "module1",
        },
      },
    ],
    createdAt: new Date(Date.now() - 120000).toISOString(),
  },
];

/**
 * Default chat container
 */
export const Default: Story = {
  args: {
    messages: sampleMessages,
    isLoading: false,
    isStreaming: false,
    onSendMessage: (message) => console.log("Send:", message),
    conversationId: "conv1",
    learningPlanId: "plan1",
  },
};

/**
 * Empty chat
 */
export const Empty: Story = {
  args: {
    messages: [],
    isLoading: false,
    isStreaming: false,
    onSendMessage: (message) => console.log("Send:", message),
    conversationId: "conv1",
    learningPlanId: "plan1",
  },
};

/**
 * Loading messages
 */
export const LoadingMessages: Story = {
  args: {
    messages: [],
    isLoading: true,
    isStreaming: false,
    onSendMessage: (message) => console.log("Send:", message),
    conversationId: "conv1",
    learningPlanId: "plan1",
  },
};

/**
 * Streaming response
 */
export const Streaming: Story = {
  args: {
    messages: [
      ...sampleMessages,
      {
        id: "5",
        conversationId: "conv1",
        role: "user",
        parts: [{ type: "text", text: "각 훅에 대한 실습 과제도 추가해줘" }],
        createdAt: new Date().toISOString(),
      },
    ],
    isLoading: true,
    isStreaming: true,
    onSendMessage: (message) => console.log("Send:", message),
    conversationId: "conv1",
    learningPlanId: "plan1",
  },
};

/**
 * Long conversation
 */
export const LongConversation: Story = {
  args: {
    messages: [
      ...sampleMessages,
      ...Array.from(
        { length: 5 },
        (_, i): Message => ({
          id: `${i + 5}`,
          conversationId: "conv1",
          role: i % 2 === 0 ? "user" : "assistant",
          parts: [{ type: "text", text: `메시지 ${i + 5}` }],
          createdAt: new Date(Date.now() - (5 - i) * 60000).toISOString(),
        }),
      ),
    ],
    isLoading: false,
    isStreaming: false,
    onSendMessage: (message) => console.log("Send:", message),
    conversationId: "conv1",
    learningPlanId: "plan1",
  },
};

/**
 * Interactive example
 */
export const Interactive: Story = {
  args: {
    messages: sampleMessages,
    isLoading: false,
    isStreaming: false,
    onSendMessage: () => {},
    conversationId: "conv1",
    learningPlanId: "plan1",
  },
  render: () => {
    const [messages, setMessages] = useState<Array<Message>>(sampleMessages);
    const [isStreaming, setIsStreaming] = useState(false);

    const handleSend = (content: string) => {
      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        conversationId: "conv1",
        role: "user",
        parts: [{ type: "text", text: content }],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Simulate AI response
      setIsStreaming(true);
      setTimeout(() => {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          conversationId: "conv1",
          role: "assistant",
          parts: [{ type: "text", text: `응답: ${content}` }],
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsStreaming(false);
      }, 2000);
    };

    return (
      <ChatContainer
        messages={messages}
        isLoading={false}
        isStreaming={isStreaming}
        onSendMessage={handleSend}
        conversationId="conv1"
        learningPlanId="plan1"
      />
    );
  },
};

/**
 * With tool invocations
 */
export const WithToolInvocations: Story = {
  args: {
    messages: [
      {
        id: "1",
        conversationId: "conv1",
        role: "user",
        parts: [
          {
            type: "text",
            text: "React, TypeScript, Next.js 모듈을 모두 추가해줘",
          },
        ],
        createdAt: new Date(Date.now() - 120000).toISOString(),
      },
      {
        id: "2",
        conversationId: "conv1",
        role: "assistant",
        parts: [
          { type: "text", text: "세 개의 모듈을 모두 추가했습니다." },
          {
            type: "tool-createModule",
            toolCallId: "tool1",
            state: "result",
            input: { title: "React" },
            result: { success: true, moduleId: "m1" },
          },
          {
            type: "tool-createModule",
            toolCallId: "tool2",
            state: "result",
            input: { title: "TypeScript" },
            result: { success: true, moduleId: "m2" },
          },
          {
            type: "tool-createModule",
            toolCallId: "tool3",
            state: "result",
            input: { title: "Next.js" },
            result: { success: true, moduleId: "m3" },
          },
        ],
        createdAt: new Date(Date.now() - 60000).toISOString(),
      },
    ],
    isLoading: false,
    isStreaming: false,
    onSendMessage: (message) => console.log("Send:", message),
    conversationId: "conv1",
    learningPlanId: "plan1",
  },
};
