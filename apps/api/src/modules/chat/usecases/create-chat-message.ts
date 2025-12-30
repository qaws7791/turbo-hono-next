import { err, ok } from "neverthrow";

import { CONFIG } from "../../../lib/config";
import { requireOpenAi } from "../../../lib/openai";
import { ApiError } from "../../../middleware/error-handler";
import { CreateChatMessageInput, CreateChatMessageResponse } from "../chat.dto";
import { chatRepository } from "../chat.repository";
import { SYSTEM_PROMPT, buildQuote, pageRange } from "../chat.utils";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  CreateChatMessageInput as CreateChatMessageInputType,
  CreateChatMessageResponse as CreateChatMessageResponseType,
} from "../chat.dto";

// ============================================================================
// Helper Functions
// ============================================================================

async function createNoDocumentResponse(
  threadId: string,
  now: Date,
): Promise<Result<CreateChatMessageResponseType, AppError>> {
  const assistantId = crypto.randomUUID();
  const contentMd = "관련 문서를 찾을 수 없습니다.";

  const insertResult = await chatRepository.insertMessage({
    id: assistantId,
    threadId,
    role: "ASSISTANT",
    contentMd,
    createdAt: now,
  });
  if (insertResult.isErr()) return err(insertResult.error);

  const updateResult = await chatRepository.updateThreadUpdatedAt(
    threadId,
    now,
  );
  if (updateResult.isErr()) return err(updateResult.error);

  return ok(
    CreateChatMessageResponse.parse({
      data: {
        id: assistantId,
        role: "ASSISTANT",
        contentMd,
        citations: [],
      },
    }),
  );
}

async function createNoChunkResponse(
  threadId: string,
  now: Date,
): Promise<Result<CreateChatMessageResponseType, AppError>> {
  const assistantId = crypto.randomUUID();
  const contentMd = "제공된 자료에서는 해당 내용을 찾을 수 없습니다.";

  const insertResult = await chatRepository.insertMessage({
    id: assistantId,
    threadId,
    role: "ASSISTANT",
    contentMd,
    createdAt: now,
  });
  if (insertResult.isErr()) return err(insertResult.error);

  return ok(
    CreateChatMessageResponse.parse({
      data: {
        id: assistantId,
        role: "ASSISTANT",
        contentMd,
        citations: [],
      },
    }),
  );
}

// ============================================================================
// Main UseCase
// ============================================================================

export async function createChatMessage(
  userId: string,
  threadId: string,
  input: CreateChatMessageInputType,
): Promise<Result<CreateChatMessageResponseType, AppError>> {
  const now = new Date();

  // 1. 입력 검증
  const parseResult = CreateChatMessageInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  // 2. 스레드 조회
  const threadResult = await chatRepository.findThreadById(userId, threadId);
  if (threadResult.isErr()) return err(threadResult.error);
  const thread = threadResult.value;

  if (!thread || thread.userId !== userId) {
    return err(
      new ApiError(404, "CHAT_THREAD_NOT_FOUND", "스레드를 찾을 수 없습니다."),
    );
  }

  // 3. 사용자 메시지 저장
  const userMsgResult = await chatRepository.insertMessage({
    id: crypto.randomUUID(),
    threadId,
    role: "USER",
    contentMd: validated.content,
    createdAt: now,
  });
  if (userMsgResult.isErr()) return err(userMsgResult.error);

  // 4. 관련 Material ID 조회
  const materialIdsResult = await chatRepository.getMaterialIdsForScope(
    userId,
    thread.scopeType,
    thread.scopeId,
  );
  if (materialIdsResult.isErr()) return err(materialIdsResult.error);
  const materialIds = materialIdsResult.value;

  // 5. Material이 없는 경우
  if (materialIds.length === 0) {
    return createNoDocumentResponse(threadId, now);
  }

  // 6. 관련 청크 검색
  const chunksResult = await chatRepository.retrieveTopChunks({
    query: validated.content,
    materialIds,
    topK: 5,
  });
  if (chunksResult.isErr()) return err(chunksResult.error);
  const chunks = chunksResult.value;

  // 7. 청크가 없는 경우
  if (chunks.length === 0) {
    return createNoChunkResponse(threadId, now);
  }

  // 8. OpenAI를 통한 응답 생성
  const context = chunks
    .map((c) => `[${c.materialTitle}]\n${c.content}`)
    .join("\n\n---\n\n");

  const client = requireOpenAi();
  const completion = await client.chat.completions.create({
    model: CONFIG.OPENAI_CHAT_MODEL,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\n제공된 문서 내용:\n${context}`,
      },
      { role: "user", content: validated.content },
    ],
  });

  const contentMd =
    completion.choices[0]?.message?.content?.trim() ||
    "응답을 생성할 수 없습니다.";
  const assistantId = crypto.randomUUID();

  const citations = chunks.slice(0, 3).map((chunk) => ({
    chunkId: chunk.chunkId,
    materialTitle: chunk.materialTitle,
    quote: buildQuote(chunk.content),
    pageRange: pageRange(chunk.pageStart ?? null, chunk.pageEnd ?? null),
  }));

  // 9. 어시스턴트 메시지 저장
  const assistantMsgResult = await chatRepository.insertMessage({
    id: assistantId,
    threadId,
    role: "ASSISTANT",
    contentMd,
    createdAt: now,
  });
  if (assistantMsgResult.isErr()) return err(assistantMsgResult.error);

  // 10. 인용 저장
  const citationsResult = await chatRepository.insertCitations(
    citations.map((citation) => ({
      id: crypto.randomUUID(),
      messageId: assistantId,
      chunkId: citation.chunkId,
      score: null,
      quote: citation.quote,
      createdAt: now,
    })),
  );
  if (citationsResult.isErr()) return err(citationsResult.error);

  // 11. 스레드 업데이트 시간 갱신
  const updateResult = await chatRepository.updateThreadUpdatedAt(
    threadId,
    now,
  );
  if (updateResult.isErr()) return err(updateResult.error);

  return ok(
    CreateChatMessageResponse.parse({
      data: {
        id: assistantId,
        role: "ASSISTANT",
        contentMd,
        citations,
      },
    }),
  );
}
