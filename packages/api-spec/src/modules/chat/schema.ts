import { z } from "@hono/zod-openapi";

import { PublicIdSchema } from "../../common/schema";

export const ChatScopeTypeSchema = z.enum(["PLAN", "SESSION"]);

export const CreateChatThreadRequestSchema = z.object({
  scopeType: ChatScopeTypeSchema,
  scopeId: PublicIdSchema,
});

export const CreateChatThreadResponseSchema = z.object({
  data: z.object({
    threadId: z.uuid(),
  }),
});

export const CreateChatMessageRequestSchema = z.object({
  content: z.string().min(1),
});

export const ChatCitationSchema = z.object({
  chunkId: z.uuid(),
  materialTitle: z.string().min(1),
  quote: z.string().min(1),
  pageRange: z.string().min(1).optional(),
});

export const ChatMessageSchema = z.object({
  id: z.uuid(),
  role: z.enum(["USER", "ASSISTANT", "SYSTEM"]),
  contentMd: z.string().min(1),
  citations: z.array(ChatCitationSchema).optional(),
});

export const CreateChatMessageResponseSchema = z.object({
  data: ChatMessageSchema,
});

export const ListChatMessagesResponseSchema = z.object({
  data: z.array(ChatMessageSchema),
});
