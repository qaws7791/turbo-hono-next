import { GoogleGenAI } from "@google/genai";
import { ResultAsync, err, ok } from "neverthrow";
import z from "zod";

import { aiError, toAiError } from "./ai-error";

import type { GenerateContentParameters } from "@google/genai";
import type { AiError } from "./ai-error";
import type { Result } from "neverthrow";

export const DEFAULT_EMBEDDING_DIMENSIONS = 1536 as const;

export type EmbeddingModelPort = {
  embedDocuments: (
    contents: string | Array<string>,
  ) => ResultAsync<Array<Array<number>>, ReturnType<typeof toAiError>>;
  embedQuery: (
    query: string,
  ) => ResultAsync<Array<number>, ReturnType<typeof toAiError>>;

  /**
   * @deprecated Use embedDocuments instead.
   */
  embedContent: (
    contents: string | Array<string>,
  ) => ResultAsync<Array<Array<number>>, ReturnType<typeof toAiError>>;
};

export type ChatModelPort = {
  generateStructuredOutput: <T extends z.ZodTypeAny>(
    params: Omit<GenerateContentParameters, "model" | "config"> & {
      config?: Omit<
        NonNullable<GenerateContentParameters["config"]>,
        "responseMimeType" | "responseJsonSchema"
      >;
    },
    schema: T,
  ) => ResultAsync<z.infer<T>, ReturnType<typeof toAiError>>;

  generateJson: (
    params: Omit<GenerateContentParameters, "model" | "config"> & {
      config?: Omit<
        NonNullable<GenerateContentParameters["config"]>,
        "responseMimeType"
      >;
    },
  ) => ResultAsync<unknown, ReturnType<typeof toAiError>>;
};

export type AiConfig = {
  readonly apiKey: string | null | undefined;
  readonly embeddingApiKey?: string | null | undefined;
  readonly chatModel: string;
  readonly embeddingModel: string;
  readonly embeddingDimensions?: number;
};

export class EmbeddingModel implements EmbeddingModelPort {
  private readonly genAI: GoogleGenAI;
  private readonly model: string;
  private readonly dimensions: number;

  constructor(params: {
    readonly genAI: GoogleGenAI;
    readonly model: string;
    readonly dimensions: number;
  }) {
    this.genAI = params.genAI;
    this.model = params.model;
    this.dimensions = params.dimensions;
  }

  embedDocuments(
    contents: string | Array<string>,
  ): ResultAsync<Array<Array<number>>, ReturnType<typeof toAiError>> {
    const list = typeof contents === "string" ? [contents] : contents;
    const sanitized = list.map((t) => t.slice(0, 8000));

    const BATCH_SIZE = 100;
    const batchCount = Math.ceil(sanitized.length / BATCH_SIZE);

    return ResultAsync.fromPromise(
      (async () => {
        const allVectors: Array<Array<number>> = [];

        for (const batchIndex of Array.from(
          { length: batchCount },
          (_, idx) => idx,
        )) {
          const start = batchIndex * BATCH_SIZE;
          const batch = sanitized.slice(start, start + BATCH_SIZE);

          const response = await this.genAI.models.embedContent({
            model: this.model,
            contents: batch,
            config: {
              taskType: "RETRIEVAL_DOCUMENT",
              outputDimensionality: this.dimensions,
            },
          });

          if (!response.embeddings) {
            throw aiError({
              code: "AI_EMBEDDING_EMPTY",
              message: "임베딩 응답이 비어있습니다.",
              details: { batchIndex },
            });
          }

          const vectors = response.embeddings.map((e) => e.values);
          if (vectors.some((v) => v === undefined)) {
            throw aiError({
              code: "AI_EMBEDDING_INVALID",
              message: "임베딩 결과가 올바르지 않습니다.",
              details: { batchIndex },
            });
          }

          allVectors.push(...(vectors as Array<Array<number>>));
        }

        return allVectors;
      })(),
      (cause) => toAiError(cause),
    );
  }

  embedQuery(
    query: string,
  ): ResultAsync<Array<number>, ReturnType<typeof toAiError>> {
    const sanitized = query.slice(0, 8000);

    return ResultAsync.fromPromise(
      this.genAI.models
        .embedContent({
          model: this.model,
          contents: [sanitized],
          config: {
            taskType: "RETRIEVAL_QUERY",
            outputDimensionality: this.dimensions,
          },
        })
        .then((response) => {
          if (!response.embeddings || response.embeddings.length === 0) {
            throw aiError({
              code: "AI_EMBEDDING_EMPTY",
              message: "임베딩 응답이 비어있습니다.",
            });
          }
          const first = response.embeddings[0];
          if (!first?.values) {
            throw aiError({
              code: "AI_EMBEDDING_INVALID",
              message: "임베딩 결과가 올바르지 않습니다.",
            });
          }
          return first.values as Array<number>;
        }),
      (cause) => toAiError(cause),
    );
  }

  /**
   * @deprecated Use embedDocuments instead.
   */
  embedContent(
    contents: string | Array<string>,
  ): ResultAsync<Array<Array<number>>, ReturnType<typeof toAiError>> {
    return this.embedDocuments(contents);
  }
}

export class ChatModel {
  private readonly genAI: GoogleGenAI;
  private readonly model: string;

  constructor(params: { readonly genAI: GoogleGenAI; readonly model: string }) {
    this.genAI = params.genAI;
    this.model = params.model;
  }

  generateStructuredOutput<T extends z.ZodTypeAny>(
    {
      config,
      ...params
    }: Omit<GenerateContentParameters, "model" | "config"> & {
      config?: Omit<
        NonNullable<GenerateContentParameters["config"]>,
        "responseMimeType" | "responseJsonSchema"
      >;
    },
    schema: T,
  ): ResultAsync<z.infer<T>, ReturnType<typeof toAiError>> {
    return ResultAsync.fromPromise(
      this.genAI.models
        .generateContent({
          model: this.model,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: z.toJSONSchema(schema),
            ...config,
          },
          ...params,
        })
        .then((response) => {
          const text = response.text;
          if (!text) {
            throw aiError({
              code: "AI_RESPONSE_EMPTY",
              message: "AI 응답이 비어있습니다.",
            });
          }
          const json = (() => {
            try {
              return JSON.parse(text);
            } catch (error) {
              throw aiError({
                code: "AI_RESPONSE_INVALID_JSON",
                message: "AI 응답 JSON 파싱에 실패했습니다.",
                cause: error,
              });
            }
          })();
          try {
            return schema.parse(json);
          } catch (error) {
            throw aiError({
              code: "AI_RESPONSE_SCHEMA_MISMATCH",
              message: "AI 응답이 스키마와 일치하지 않습니다.",
              cause: error,
            });
          }
        }),
      (cause) => toAiError(cause),
    );
  }

  generateJson({
    config,
    ...params
  }: Omit<GenerateContentParameters, "model" | "config"> & {
    config?: Omit<
      NonNullable<GenerateContentParameters["config"]>,
      "responseMimeType"
    >;
  }): ResultAsync<unknown, ReturnType<typeof toAiError>> {
    return ResultAsync.fromPromise(
      this.genAI.models
        .generateContent({
          model: this.model,
          config: {
            responseMimeType: "application/json",
            ...config,
          },
          ...params,
        })
        .then((response) => {
          const text = response.text;
          if (!text) {
            throw aiError({
              code: "AI_RESPONSE_EMPTY",
              message: "AI 응답이 비어있습니다.",
            });
          }
          try {
            return JSON.parse(text);
          } catch (error) {
            throw aiError({
              code: "AI_RESPONSE_INVALID_JSON",
              message: "AI 응답 JSON 파싱에 실패했습니다.",
              cause: error,
            });
          }
        }),
      (cause) => toAiError(cause),
    );
  }
}

export type AiModels = {
  readonly chat: ChatModelPort;
  readonly embedding: EmbeddingModelPort;
};

export function createAiModels(config: AiConfig): Result<AiModels, AiError> {
  const chatApiKey = config.apiKey;
  if (!chatApiKey) {
    return err(
      aiError({
        code: "AI_UNAVAILABLE",
        message: "AI 기능이 설정되지 않았습니다.",
      }),
    );
  }

  const embeddingApiKey = config.embeddingApiKey ?? chatApiKey;

  return ok({
    chat: new ChatModel({
      genAI: new GoogleGenAI({ apiKey: chatApiKey }),
      model: config.chatModel,
    }),
    embedding: new EmbeddingModel({
      genAI: new GoogleGenAI({ apiKey: embeddingApiKey }),
      model: config.embeddingModel,
      dimensions:
        config.embeddingDimensions ?? (DEFAULT_EMBEDDING_DIMENSIONS as number),
    }),
  });
}
