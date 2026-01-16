import { GoogleGenAI } from "@google/genai";
import { Embeddings } from "@langchain/core/embeddings";

import { EMBEDDING_DIMENSIONS } from "../../lib/ai";
import { CONFIG } from "../../lib/config";

import type { EmbeddingsParams } from "@langchain/core/embeddings";

export interface GoogleCustomEmbeddingsParams extends EmbeddingsParams {
  readonly apiKey?: string;
  readonly model?: string;
  readonly dimensions?: number;
}

export class GoogleCustomEmbeddings extends Embeddings {
  private client: GoogleGenAI;
  private model: string;
  private dimensions: number;

  constructor(fields?: GoogleCustomEmbeddingsParams) {
    super(fields ?? {});
    this.client = new GoogleGenAI({
      apiKey: fields?.apiKey ?? CONFIG.GEMINI_EMBEDDING_API_KEY,
    });
    this.model = fields?.model ?? CONFIG.GEMINI_EMBEDDING_MODEL;
    this.dimensions = fields?.dimensions ?? EMBEDDING_DIMENSIONS;
  }

  async embedDocuments(texts: Array<string>): Promise<Array<Array<number>>> {
    // 텍스트가 너무 길면 잘라냄 (SDK 제한 대응)
    const sanitizedTexts = texts.map((t) => t.slice(0, 8000));

    // Gemini API는 한 번의 배치 요청당 최대 100개까지만 허용함
    const BATCH_SIZE = 100;
    const allVectors: Array<Array<number>> = [];

    for (let i = 0; i < sanitizedTexts.length; i += BATCH_SIZE) {
      const batch = sanitizedTexts.slice(i, i + BATCH_SIZE);

      const response = await this.client.models.embedContent({
        model: this.model,
        contents: batch,
        config: {
          taskType: "RETRIEVAL_DOCUMENT",
          outputDimensionality: this.dimensions,
        },
      });

      if (!response.embeddings) {
        throw new Error(`Failed to embed contents at batch ${i / BATCH_SIZE}`);
      }

      const vectors = response.embeddings.map((e) => e.values);
      if (vectors.some((v) => v === undefined)) {
        throw new Error(
          `Failed to embed contents at batch ${i / BATCH_SIZE}: some values are undefined`,
        );
      }

      allVectors.push(...(vectors as Array<Array<number>>));
    }

    return allVectors;
  }

  async embedQuery(text: string): Promise<Array<number>> {
    const sanitizedText = text.slice(0, 8000);

    const response = await this.client.models.embedContent({
      model: this.model,
      contents: [sanitizedText],
      config: {
        taskType: "RETRIEVAL_QUERY",
        outputDimensionality: this.dimensions,
      },
    });

    if (!response.embeddings || response.embeddings.length === 0) {
      throw new Error("Failed to embed query");
    }

    const firstResult = response.embeddings[0];
    if (!firstResult) {
      throw new Error("Failed to embed query: no result found");
    }

    const vector = firstResult.values;
    if (vector === undefined) {
      throw new Error("Failed to embed query: value is undefined");
    }

    return vector as Array<number>;
  }
}
