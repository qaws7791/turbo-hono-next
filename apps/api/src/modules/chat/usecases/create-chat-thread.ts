import { err, ok } from "neverthrow";

import { ApiError } from "../../../middleware/error-handler";
import { CreateChatThreadInput, CreateChatThreadResponse } from "../chat.dto";
import { chatRepository } from "../chat.repository";

import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/result";
import type {
  CreateChatThreadInput as CreateChatThreadInputType,
  CreateChatThreadResponse as CreateChatThreadResponseType,
} from "../chat.dto";

export async function createChatThread(
  userId: string,
  input: CreateChatThreadInputType,
): Promise<Result<CreateChatThreadResponseType, AppError>> {
  const now = new Date();
  const threadId = crypto.randomUUID();

  // 1. 입력 검증
  const parseResult = CreateChatThreadInput.safeParse(input);
  if (!parseResult.success) {
    return err(
      new ApiError(400, "VALIDATION_ERROR", parseResult.error.message),
    );
  }
  const validated = parseResult.data;

  // 2. 스코프 조회
  const scopeResult = await chatRepository.getScopeSpaceId(
    userId,
    validated.scopeType,
    validated.scopeId,
  );
  if (scopeResult.isErr()) return err(scopeResult.error);
  const scope = scopeResult.value;

  // 3. 스레드 생성
  const insertResult = await chatRepository.insertThread({
    id: threadId,
    userId,
    spaceId: scope.spaceId,
    scopeType: validated.scopeType,
    scopeId: scope.scopeId,
    createdAt: now,
    updatedAt: now,
  });
  if (insertResult.isErr()) return err(insertResult.error);

  return ok(CreateChatThreadResponse.parse({ data: { threadId } }));
}
