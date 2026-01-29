import type { ResultAsync } from "neverthrow";
import type { AppError } from "../../../common/result";
import type { SessionBlueprint } from "./schema";
import type { KnowledgeFacade } from "../../knowledge/api";

export type KnowledgeFacadeForSessionPort = Pick<
  KnowledgeFacade,
  "retrieveRange"
>;

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
