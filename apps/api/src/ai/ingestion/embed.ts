import { embeddingAI } from "../../lib/ai";

export async function embedTexts(texts: ReadonlyArray<string>): Promise<{
  vectors: ReadonlyArray<Array<number>>;
}> {
  const input = texts.map((t) => t.slice(0, 8000));
  const vectors = await embeddingAI.embedContent(input);
  return { vectors };
}
