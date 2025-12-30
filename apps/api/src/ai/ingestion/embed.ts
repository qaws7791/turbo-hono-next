import { CONFIG } from "../../lib/config";
import { requireOpenAi } from "../../lib/openai";

export type EmbeddingResult = {
  readonly vectors: ReadonlyArray<Array<number>>;
  readonly model: string;
};

export async function embedTexts(
  texts: ReadonlyArray<string>,
): Promise<EmbeddingResult> {
  const client = requireOpenAi();

  const input = texts.map((t) => t.slice(0, 8000));
  const response = await client.embeddings.create({
    model: CONFIG.OPENAI_EMBEDDING_MODEL,
    input,
  });

  const vectors = response.data.map((item) => item.embedding);
  return { vectors, model: response.model };
}
