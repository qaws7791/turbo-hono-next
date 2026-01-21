import { getAiModelsAsync } from "../../lib/ai";

import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../lib/result";

export function embedTexts(
  texts: ReadonlyArray<string>,
): ResultAsync<{ vectors: ReadonlyArray<Array<number>> }, AppError> {
  const input = texts.map((t) => t.slice(0, 8000));
  return getAiModelsAsync()
    .andThen((models) => models.embedding.embedContent(input))
    .map((vectors) => ({ vectors }));
}
