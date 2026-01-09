import { z } from "zod";

import { isPublicId } from "../../lib/public-id";

const PublicIdSchema = z.string().refine(isPublicId, "Invalid public id");

export const ChatScopeTypeSchema = z.enum(["PLAN", "SESSION"]);
export type ChatScopeType = z.infer<typeof ChatScopeTypeSchema>;

export const CreateChatThreadInput = z.object({
  scopeType: ChatScopeTypeSchema,
  scopeId: PublicIdSchema,
});
export type CreateChatThreadInput = z.infer<typeof CreateChatThreadInput>;

export const CreateChatThreadResponse = z.object({
  data: z.object({
    threadId: z.string().uuid(),
  }),
});
export type CreateChatThreadResponse = z.infer<typeof CreateChatThreadResponse>;

export const CreateChatMessageInput = z.object({
  content: z.string().min(1),
});
export type CreateChatMessageInput = z.infer<typeof CreateChatMessageInput>;

export const ChatCitation = z.object({
  chunkId: z.string().uuid(),
  materialTitle: z.string().min(1),
  quote: z.string().min(1),
  pageRange: z.string().min(1).optional(),
});
export type ChatCitation = z.infer<typeof ChatCitation>;

export const ChatMessage = z.object({
  id: z.string().uuid(),
  role: z.enum(["USER", "ASSISTANT", "SYSTEM"]),
  contentMd: z.string().min(1),
  citations: z.array(ChatCitation).optional(),
});
export type ChatMessage = z.infer<typeof ChatMessage>;

export const CreateChatMessageResponse = z.object({
  data: ChatMessage,
});
export type CreateChatMessageResponse = z.infer<
  typeof CreateChatMessageResponse
>;

export const ListChatMessagesResponse = z.object({
  data: z.array(ChatMessage),
});
export type ListChatMessagesResponse = z.infer<typeof ListChatMessagesResponse>;
