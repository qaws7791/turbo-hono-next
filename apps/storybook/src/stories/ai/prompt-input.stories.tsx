import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools
} from "@repo/ui/ai/prompt-input";
import { useState } from "react";

import type {PromptInputMessage} from "@repo/ui/ai/prompt-input";
import type { ChatStatus } from "ai";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "AI Elements/PromptInput",
  component: PromptInput,
  tags: ["autodocs"],
} satisfies Meta<typeof PromptInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const PromptInputDemo = () => {
  const [status, setStatus] = useState<ChatStatus | undefined>(undefined);
  const [lastMessage, setLastMessage] = useState<string>("");

  const handleSubmit = async (message: PromptInputMessage) => {
    setLastMessage(message.text);
    setStatus("submitted");
    await new Promise((resolve) => setTimeout(resolve, 800));
    setStatus(undefined);
  };

  return (
    <div className="w-full max-w-2xl space-y-3">
      <PromptInput
        onSubmit={handleSubmit}
        globalDrop
        multiple
      >
        <PromptInputHeader>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea placeholder="Ask about the roadmap..." />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
                <PromptInputActionMenuItem>
                  Insert template
                </PromptInputActionMenuItem>
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>
          <PromptInputSubmit status={status} />
        </PromptInputFooter>
      </PromptInput>
      {lastMessage ? (
        <p className="text-muted-foreground text-xs">
          Last message: {lastMessage}
        </p>
      ) : (
        <p className="text-muted-foreground text-xs">
          Tip: Press Enter to submit, Shift+Enter for a new line.
        </p>
      )}
    </div>
  );
};

export const Default: Story = {
  render: () => <PromptInputDemo />,
};
