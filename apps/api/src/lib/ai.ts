import { GoogleGenAI } from "@google/genai";
import { ResultAsync, err, ok } from "neverthrow";
import z from "zod";

import { ApiError } from "../middleware/error-handler";

import { CONFIG } from "./config";
import { toAppError, tryPromise } from "./result";

import type { GenerateContentParameters } from "@google/genai";
import type { Result } from "neverthrow";
import type { AppError } from "./result";
import type { Config } from "./config";

export const EMBEDDING_DIMENSIONS = 1536 as const;

export class EmbeddingModel {
  private genAI: GoogleGenAI;
  private model: string;

  constructor(params: { readonly genAI: GoogleGenAI; readonly model: string }) {
    this.genAI = params.genAI;
    this.model = params.model;
  }

  embedContent(
    contents: string | Array<string>,
  ): ResultAsync<Array<Array<number>>, AppError> {
    return tryPromise(async () => {
      const response = await this.genAI.models.embedContent({
        model: this.model,
        contents,
        config: {
          taskType: "RETRIEVAL_DOCUMENT",
          outputDimensionality: EMBEDDING_DIMENSIONS,
        },
      });
      if (!response.embeddings) {
        throw new ApiError(
          502,
          "AI_EMBEDDING_EMPTY",
          "임베딩 응답이 비어있습니다.",
        );
      }
      const vectors = response.embeddings.map((e) => e.values);
      if (vectors.some((v) => v === undefined)) {
        throw new ApiError(
          502,
          "AI_EMBEDDING_INVALID",
          "임베딩 결과가 올바르지 않습니다.",
        );
      }
      return vectors as Array<Array<number>>;
    });
  }
}

export class ChatModel {
  private genAI: GoogleGenAI;
  private model: string;

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
  ): ResultAsync<z.infer<T>, AppError> {
    return tryPromise(async () => {
      const response = await this.genAI.models.generateContent({
        model: this.model,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: z.toJSONSchema(schema),
          ...config,
        },
        ...params,
      });
      const text = response.text;
      if (!text) {
        throw new ApiError(502, "AI_RESPONSE_EMPTY", "AI 응답이 비어있습니다.");
      }
      const parsedJson = (() => {
        try {
          return JSON.parse(text);
        } catch (error) {
          throw new ApiError(
            502,
            "AI_RESPONSE_INVALID_JSON",
            "AI 응답 JSON 파싱에 실패했습니다.",
            { error: error instanceof Error ? error.message : String(error) },
          );
        }
      })();
      return (() => {
        try {
          return schema.parse(parsedJson);
        } catch (error) {
          throw new ApiError(
            502,
            "AI_RESPONSE_SCHEMA_MISMATCH",
            "AI 응답이 스키마와 일치하지 않습니다.",
            { error: error instanceof Error ? error.message : String(error) },
          );
        }
      })();
    });
  }

  generateJson({
    config,
    ...params
  }: Omit<GenerateContentParameters, "model" | "config"> & {
    config?: Omit<
      NonNullable<GenerateContentParameters["config"]>,
      "responseMimeType"
    >;
  }): ResultAsync<unknown, AppError> {
    return tryPromise(async () => {
      const response = await this.genAI.models.generateContent({
        model: this.model,
        config: {
          responseMimeType: "application/json",
          ...config,
        },
        ...params,
      });
      const text = response.text;
      if (!text) {
        throw new ApiError(502, "AI_RESPONSE_EMPTY", "AI 응답이 비어있습니다.");
      }
      try {
        return JSON.parse(text);
      } catch (error) {
        throw new ApiError(
          502,
          "AI_RESPONSE_INVALID_JSON",
          "AI 응답 JSON 파싱에 실패했습니다.",
          { error: error instanceof Error ? error.message : String(error) },
        );
      }
    });
  }
}

export type AiModels = {
  readonly chat: ChatModel;
  readonly embedding: EmbeddingModel;
};

export function createAiModels(config: Config): Result<AiModels, AppError> {
  const chatApiKey = config.AI_API_KEY;
  if (!chatApiKey) {
    return err(
      new ApiError(503, "AI_UNAVAILABLE", "AI 기능이 설정되지 않았습니다."),
    );
  }

  const embeddingApiKey = config.AI_EMBEDDING_API_KEY ?? chatApiKey;

  return ok({
    chat: new ChatModel({
      genAI: new GoogleGenAI({ apiKey: chatApiKey }),
      model: config.GEMINI_CHAT_MODEL,
    }),
    embedding: new EmbeddingModel({
      genAI: new GoogleGenAI({ apiKey: embeddingApiKey }),
      model: config.GEMINI_EMBEDDING_MODEL,
    }),
  });
}

const cachedAiModelsRef: { current: AiModels | null } = { current: null };

export function getAiModels(): Result<AiModels, AppError> {
  if (cachedAiModelsRef.current) return ok(cachedAiModelsRef.current);
  const created = createAiModels(CONFIG);
  if (created.isOk()) {
    cachedAiModelsRef.current = created.value;
  }
  return created;
}

export function getAiModelsAsync(): ResultAsync<AiModels, AppError> {
  return ResultAsync.fromPromise(Promise.resolve(getAiModels()), (cause) =>
    toAppError(cause),
  ).andThen((result) => result);
}
