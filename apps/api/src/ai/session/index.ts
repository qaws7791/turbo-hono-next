import { SessionBlueprintGenerator } from "./generator";

export * from "./generator";
export * from "./schema";

export const sessionBlueprintGenerator = new SessionBlueprintGenerator();

/**
 * @deprecated Use sessionBlueprintGenerator.generate() instead
 */
export const generateSessionBlueprintWithAi =
  sessionBlueprintGenerator.generate.bind(sessionBlueprintGenerator);
