import { GoogleGenAI } from "@google/genai";
import z from "zod";

import { CONFIG } from "./config";

import type { GenerateContentParameters } from "@google/genai";

export const EMBEDDING_DIMENSIONS = 1536 as const;

export class EmbeddingModel {
  private genAI: GoogleGenAI;

  constructor(genAI: GoogleGenAI) {
    this.genAI = genAI;
  }

  async embedContent(
    contents: string | Array<string>,
  ): Promise<Array<Array<number>>> {
    const response = await this.genAI.models.embedContent({
      model: CONFIG.GEMINI_EMBEDDING_MODEL,
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

  constructor(genAI: GoogleGenAI) {
    this.genAI = genAI;
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
      model: CONFIG.GEMINI_CHAT_MODEL,
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

export const embeddingAI = new EmbeddingModel(
  new GoogleGenAI({ apiKey: CONFIG.GEMINI_EMBEDDING_API_KEY }),
);

export const chatAI = new ChatModel(
  new GoogleGenAI({ apiKey: CONFIG.GEMINI_API_KEY }),
);
