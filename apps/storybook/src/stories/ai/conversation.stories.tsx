import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@repo/ui/ai/conversation";
import { Message, MessageContent, MessageResponse } from "@repo/ui/ai/message";

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { UIMessage } from "ai";

const sampleMessages: Array<
  Pick<UIMessage, "role"> & { id: string; text: string }
> = [
  {
    id: "1",
    role: "assistant",
    text: "Welcome! Ask me anything about your roadmap.",
  },
  {
    id: "2",
    role: "user",
    text: "Give me a 4-week TypeScript plan.",
  },
  {
    id: "3",
    role: "assistant",
    text: "Week 1 focuses on types, interfaces, and narrowing.",
  },
  {
    id: "4",
    role: "assistant",
    text: "Week 2 covers generics, utility types, and inference.",
  },
  {
    id: "5",
    role: "assistant",
    text: "Week 3 is about tooling, tsconfig, and strict mode.",
  },
  {
    id: "6",
    role: "assistant",
    text: "Week 4 combines projects and advanced patterns.",
  },
  {
    id: "7",
    role: "user",
    text: "Can you share a checklist for week 1?",
  },
  {
    id: "8",
    role: "assistant",
    text: "Sure! Start with primitive types and unions.",
  },
];

const meta = {
  title: "AI Elements/Conversation",
  component: Conversation,
  tags: ["autodocs"],
} satisfies Meta<typeof Conversation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <ConversationContent>
          {sampleMessages.map((message) => (
            <Message
              from={message.role}
              key={message.id}
            >
              <MessageContent>
                <MessageResponse>{message.text}</MessageResponse>
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </>
    ),
  },
  render: (props) => (
    <div className="flex h-80 w-full max-w-2xl flex-col rounded-lg border">
      <Conversation
        className="h-full"
        {...props}
      ></Conversation>
    </div>
  ),
};
