import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../common/result";
import type { SessionBlueprint } from "./schema";

export type RagRetrieverForSessionPort = {
  retrieveRange: (params: {
    userId: string;
    materialId: string;
    startIndex: number;
    endIndex: number;
  }) => ResultAsync<ReadonlyArray<{ content: string }>, AppError>;
};

export type SessionBlueprintGeneratorPort = {
  generate: (input: {
    sessionType: "LEARN";
    planTitle: string;
    moduleTitle: string;
    sessionTitle: string;
    objective: string | null;
    estimatedMinutes: number;
    createdAt: Date;
    chunkContents: ReadonlyArray<string>;
  }) => ResultAsync<SessionBlueprint, AppError>;
};
