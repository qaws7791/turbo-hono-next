import { err, ok } from "neverthrow";
import { z } from "zod";

import { ApiError } from "../../../middleware/error-handler";
import { ChatCitation, ListChatMessagesResponse } from "../chat.dto";
import { chatRepository } from "../chat.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type { ListChatMessagesResponse as ListChatMessagesResponseType } from "../chat.dto";

export async function listChatMessages(
  userId: string,
  threadId: string,
): Promise<Result<ListChatMessagesResponseType, AppError>> {
  // 1. 스레드 조회
  const threadResult = await chatRepository.findThreadById(userId, threadId);
  if (threadResult.isErr()) return err(threadResult.error);
  const thread = threadResult.value;

  if (!thread || thread.userId !== userId) {
    return err(
      new ApiError(404, "CHAT_THREAD_NOT_FOUND", "스레드를 찾을 수 없습니다."),
    );
  }

  // 2. 메시지 목록 조회
  const messagesResult = await chatRepository.listMessages(threadId);
  if (messagesResult.isErr()) return err(messagesResult.error);
  const messages = messagesResult.value;

  const citationsSchema = z.array(ChatCitation);

  return ok(
    ListChatMessagesResponse.parse({
      data: messages.map((m) => ({
        id: m.id,
        role: m.role,
        contentMd: m.contentMd,
        citations: (() => {
          const meta = m.metadataJson;
          if (!meta || typeof meta !== "object") return undefined;
          const value = (meta as Record<string, unknown>).citations;
          const parsed = citationsSchema.safeParse(value);
          return parsed.success ? parsed.data : undefined;
        })(),
      })),
    }),
  );
}
