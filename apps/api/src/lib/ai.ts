import { GoogleGenAI } from "@google/genai";
import z from "zod";

import { ApiError } from "../middleware/error-handler";

import { CONFIG } from "./config";

import type { GenerateContentParameters } from "@google/genai";
import type { Config } from "./config";

export const EMBEDDING_DIMENSIONS = 1536 as const;

export class EmbeddingModel {
  private genAI: GoogleGenAI;
  private model: string;

  constructor(params: { readonly genAI: GoogleGenAI; readonly model: string }) {
    this.genAI = params.genAI;
    this.model = params.model;
  }

  async embedContent(
    contents: string | Array<string>,
  ): Promise<Array<Array<number>>> {
    const response = await this.genAI.models.embedContent({
      model: this.model,
      contents,
      config: {
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    });
    if (!response.embeddings) {
      throw new Error("Failed to embed content");
    }
    const vectors = response.embeddings.map((e) => e.values);
    if (vectors.some((v) => v === undefined)) {
      throw new Error("Failed to embed content");
    }
    return vectors as Array<Array<number>>;
  }
}

export class ChatModel {
  private genAI: GoogleGenAI;
  private model: string;

  constructor(params: { readonly genAI: GoogleGenAI; readonly model: string }) {
    this.genAI = params.genAI;
    this.model = params.model;
  }

  async generateStructuredOutput<T extends z.ZodTypeAny>(
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
  ) {
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
      throw new Error("Failed to generate structured output");
    }
    const result = schema.parse(JSON.parse(text));
    return result;
  }
}

export type AiModels = {
  readonly chat: ChatModel;
  readonly embedding: EmbeddingModel;
};

export function createAiModels(config: Config): AiModels {
  const chatApiKey = config.AI_API_KEY;
  if (!chatApiKey) {
    throw new ApiError(503, "AI_UNAVAILABLE", "AI 기능이 설정되지 않았습니다.");
  }

  const embeddingApiKey = config.AI_EMBEDDING_API_KEY ?? chatApiKey;

  return {
    chat: new ChatModel({
      genAI: new GoogleGenAI({ apiKey: chatApiKey }),
      model: config.GEMINI_CHAT_MODEL,
    }),
    embedding: new EmbeddingModel({
      genAI: new GoogleGenAI({ apiKey: embeddingApiKey }),
      model: config.GEMINI_EMBEDDING_MODEL,
    }),
  };
}

let cachedAiModels: AiModels | null = null;

export function getAiModels(): AiModels {
  if (cachedAiModels) return cachedAiModels;
  cachedAiModels = createAiModels(CONFIG);
  return cachedAiModels;
}
