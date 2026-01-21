import {
  Message,
  MessageAction,
  MessageActions,
  MessageAttachment,
  MessageAttachments,
  MessageContent,
  MessageResponse,
  MessageToolbar,
} from "@repo/ui/ai/message";
import { CopyIcon, ThumbsUpIcon } from "lucide-react";

import type { FileUIPart } from "ai";
import type { Meta, StoryObj } from "@storybook/react-vite";

const imageAttachment: FileUIPart = {
  type: "file",
  url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
  mediaType: "image/png",
  filename: "wireframe.png",
};

const fileAttachment: FileUIPart = {
  type: "file",
  url: "https://example.com/plan.pdf",
  mediaType: "application/pdf",
  filename: "plan.pdf",
};

const meta = {
  title: "AI Elements/Message",
  component: Message,
  tags: ["autodocs"],
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    from: "assistant",
  },
  render: () => (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <Message from="user">
        <MessageContent>
          <MessageResponse>
            Summarize the onboarding doc and suggest next steps.
          </MessageResponse>
        </MessageContent>
      </Message>

      <Message from="assistant">
        <MessageContent>
          <MessageResponse>
            **Highlights:** - Set up the environment and run the starter tests.
            - Examine the API contracts in the docs folder. - Focus on the
            onboarding checklist for week 1.
          </MessageResponse>
        </MessageContent>
        <MessageAttachments>
          <MessageAttachment data={imageAttachment} />
          <MessageAttachment data={fileAttachment} />
        </MessageAttachments>
        <MessageToolbar>
          <MessageActions>
            <MessageAction
              label="Copy"
              tooltip="Copy response"
            >
              <CopyIcon className="size-4" />
            </MessageAction>
            <MessageAction
              label="Upvote"
              tooltip="Helpful"
            >
              <ThumbsUpIcon className="size-4" />
            </MessageAction>
          </MessageActions>
        </MessageToolbar>
      </Message>
    </div>
  ),
};
