import { Embeddings } from "@langchain/core/embeddings";

import { coreError } from "../../../../common/core-error";

import type { AiError , EmbeddingModelPort } from "@repo/ai";

export class KnowledgeEmbeddingsAdapter extends Embeddings {
  private readonly embeddingModel: EmbeddingModelPort;

  constructor(params: { readonly embeddingModel: EmbeddingModelPort }) {
    super({});
    this.embeddingModel = params.embeddingModel;
  }

  async embedDocuments(texts: Array<string>): Promise<Array<Array<number>>> {
    const vectors = await this.embeddingModel.embedDocuments(texts).match(
      (ok) => ok,
      (error) => {
        throw this.toCoreEmbeddingError(error);
      },
    );
    return vectors;
  }

  async embedQuery(text: string): Promise<Array<number>> {
    const vector = await this.embeddingModel.embedQuery(text).match(
      (ok) => ok,
      (error) => {
        throw this.toCoreEmbeddingError(error);
      },
    );
    return vector;
  }

  private toCoreEmbeddingError(error: AiError) {
    return coreError({
      code: error.code,
      message: error.message,
      details: error.details,
      cause: error.cause,
    });
  }
}
