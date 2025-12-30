import { createErrorThrower } from "../../lib/errors";

export const ConceptErrors = {
  NOT_FOUND: {
    status: 404,
    code: "CONCEPT_NOT_FOUND",
    message: "Concept를 찾을 수 없습니다.",
  },
} as const;

export const throwConceptError = createErrorThrower(ConceptErrors);
