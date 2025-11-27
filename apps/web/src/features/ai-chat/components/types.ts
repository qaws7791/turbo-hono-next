import type { PromptInputMessage } from "@repo/ui/ai";

export type ChatView =
  | { type: "new" }
  | {
      type: "active";
      conversationId: string;
      pendingMessage?: PromptInputMessage;
    };
