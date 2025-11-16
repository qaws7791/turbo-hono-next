import type { AppUIMessage } from "@repo/ai-types";
import type { AIMessage } from "@repo/database";

/**
 * Convert database AI messages to UI messages format
 */
export function convertToUIMessages(
  messages: Array<AIMessage>,
): Array<AppUIMessage> {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as "user" | "assistant" | "system",
    parts: message.parts as AppUIMessage["parts"],
  }));
}

/**
 * Convert UI messages to database format for saving
 */
export function convertToDBMessages(
  messages: Array<AppUIMessage>,
  conversationId: string,
): Array<{
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  parts: unknown;
  attachments: Array<unknown>;
  createdAt: Date;
}> {
  return messages.map((msg) => ({
    id: msg.id,
    conversationId: conversationId,
    role: msg.role,
    parts: msg.parts,
    attachments: [],
    createdAt: new Date(),
  }));
}
