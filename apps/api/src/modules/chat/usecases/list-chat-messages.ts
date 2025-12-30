import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { ListChatMessagesResponse } from "../chat.dto";
import { chatRepository } from "../chat.repository";
import { pageRange } from "../chat.utils";

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

  // 3. 인용 정보 조회
  const citationsResult = await chatRepository.listCitationsForMessages(
    messages.map((m) => m.id),
  );
  if (citationsResult.isErr()) return err(citationsResult.error);
  const citationRows = citationsResult.value;

  // 4. 인용 맵 생성
  const citationMap = new Map<
    string,
    Array<{
      chunkId: string;
      materialTitle: string;
      quote: string;
      pageRange?: string;
    }>
  >();

  citationRows.forEach((row) => {
    const quote = (row.quote ?? "").trim();
    if (quote.length === 0) return;

    const list = citationMap.get(row.messageId) ?? [];
    list.push({
      chunkId: row.chunkId,
      materialTitle: row.materialTitle,
      quote,
      pageRange: pageRange(row.pageStart ?? null, row.pageEnd ?? null),
    });
    citationMap.set(row.messageId, list);
  });

  return ok(
    ListChatMessagesResponse.parse({
      data: messages.map((m) => ({
        id: m.id,
        role: m.role,
        contentMd: m.contentMd,
        citations: citationMap.get(m.id),
      })),
    }),
  );
}
