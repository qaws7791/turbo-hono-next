import { MessageList } from "@repo/ui/ai";

import type { Message } from "@repo/ui/ai";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * MessageList component displays a scrollable list of messages
 *
 * Features:
 * - Auto-scroll to bottom on new messages
 * - Loading indicator
 * - Empty state
 * - Overflow handling
 */
const meta = {
  title: "AI/MessageList",
  component: MessageList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="h-[500px] w-[600px] border border-gray-200 rounded-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MessageList>;

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
  {
    id: "5",
    conversationId: "conv1",
    role: "user",
    parts: [
      {
        type: "text",
        text: "useState와 useEffect에 대한 실습 과제도 추가해줘",
      },
    ],
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: "6",
    conversationId: "conv1",
    role: "assistant",
    parts: [
      { type: "text", text: "useState와 useEffect 실습 과제를 추가했습니다." },
    ],
    createdAt: new Date().toISOString(),
  },
];

/**
 * Default message list with conversation
 */
export const Default: Story = {
  args: {
    messages: sampleMessages,
    isLoading: false,
  },
};

/**
 * Empty message list
 */
export const Empty: Story = {
  args: {
    messages: [],
    isLoading: false,
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    messages: sampleMessages,
    isLoading: true,
  },
};

/**
 * Single message
 */
export const SingleMessage: Story = {
  args: {
    messages: [sampleMessages[0]],
    isLoading: false,
  },
};

/**
 * Long conversation
 */
export const LongConversation: Story = {
  args: {
    messages: [
      ...sampleMessages,
      ...sampleMessages.map((msg, idx) => ({
        ...msg,
        id: `${msg.id}-${idx}`,
        createdAt: new Date(Date.now() + idx * 10000).toISOString(),
      })),
    ],
    isLoading: false,
  },
};

/**
 * With loading after messages
 */
export const LoadingAfterMessages: Story = {
  args: {
    messages: [sampleMessages[0], sampleMessages[1]],
    isLoading: true,
  },
};
