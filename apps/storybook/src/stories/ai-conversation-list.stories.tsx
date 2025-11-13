import { ConversationList } from "@repo/ui/ai";
import { useState } from "react";

import type { Conversation } from "@repo/ui/ai";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * ConversationList component displays a list of chat conversations
 *
 * Features:
 * - Conversation selection
 * - Create new conversation
 * - Delete conversation
 * - Empty state
 * - Scrollable list
 */
const meta = {
  title: "AI/ConversationList",
  component: ConversationList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="h-[500px] w-[300px] border border-gray-200 rounded-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConversationList>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleConversations: Array<Conversation> = [
  {
    id: "conv1",
    learningPlanId: "plan1",
    userId: "user1",
    title: "React 학습 계획",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "conv2",
    learningPlanId: "plan1",
    userId: "user1",
    title: "모듈 추가 요청",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "conv3",
    learningPlanId: "plan1",
    userId: "user1",
    title: "학습 진도 체크",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "conv4",
    learningPlanId: "plan1",
    userId: "user1",
    title: null,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

/**
 * Default conversation list
 */
export const Default: Story = {
  args: {
    conversations: sampleConversations,
    selectedId: "conv1",
    onSelect: (id) => console.log("Selected:", id),
    learningPlanId: "plan1",
  },
};

/**
 * Empty conversation list
 */
export const Empty: Story = {
  args: {
    conversations: [],
    selectedId: null,
    onSelect: (id) => console.log("Selected:", id),
    learningPlanId: "plan1",
  },
};

/**
 * With create button
 */
export const WithCreateButton: Story = {
  args: {
    conversations: sampleConversations,
    selectedId: "conv1",
    onSelect: (id) => console.log("Selected:", id),
    onCreateNew: () => console.log("Create new conversation"),
    learningPlanId: "plan1",
  },
};

/**
 * With delete functionality
 */
export const WithDelete: Story = {
  args: {
    conversations: sampleConversations,
    selectedId: "conv1",
    onSelect: (id) => console.log("Selected:", id),
    onDelete: (id) => console.log("Delete:", id),
    learningPlanId: "plan1",
  },
};

/**
 * No selection
 */
export const NoSelection: Story = {
  args: {
    conversations: sampleConversations,
    selectedId: null,
    onSelect: (id) => console.log("Selected:", id),
    learningPlanId: "plan1",
  },
};

/**
 * Long conversation list
 */
export const LongList: Story = {
  args: {
    conversations: [
      ...sampleConversations,
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `conv${i + 5}`,
        learningPlanId: "plan1",
        userId: "user1",
        title: `대화 ${i + 5}`,
        createdAt: new Date(Date.now() - (i + 5) * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
      })),
    ],
    selectedId: "conv1",
    onSelect: (id) => console.log("Selected:", id),
    learningPlanId: "plan1",
  },
};

/**
 * Interactive example with state
 */
export const Interactive: Story = {
  render: () => {
    const [conversations, setConversations] =
      useState<Array<Conversation>>(sampleConversations);
    const [selectedId, setSelectedId] = useState<string | null>("conv1");

    const handleDelete = (id: string) => {
      setConversations((prev) => prev.filter((conv) => conv.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
    };

    const handleCreateNew = () => {
      const newConv: Conversation = {
        id: `conv${Date.now()}`,
        learningPlanId: "plan1",
        userId: "user1",
        title: "새 대화",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConversations((prev) => [newConv, ...prev]);
      setSelectedId(newConv.id);
    };

    return (
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreateNew={handleCreateNew}
        onDelete={handleDelete}
        learningPlanId="plan1"
      />
    );
  },
};
