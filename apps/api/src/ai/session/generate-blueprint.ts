import { zodTextFormat } from "openai/helpers/zod";

import { CONFIG } from "../../lib/config";
import { logger } from "../../lib/logger";
import { requireOpenAi } from "../../lib/openai";
import { ApiError } from "../../middleware/error-handler";
import { SessionBlueprint } from "../../modules/session";

import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import { AiSessionBlueprintSpecSchema } from "./schema";

import type {
  SessionBlueprint as SessionBlueprintType,
  SessionStep,
} from "../../modules/session";
import type { AiSessionBlueprintSpec, AiSessionStepSpec } from "./schema";

/**
 * AI를 사용하여 세션 블루프린트 생성
 */
export async function generateSessionBlueprintWithAi(input: {
  readonly sessionType: "LEARN";
  readonly planTitle: string;
  readonly moduleTitle: string;
  readonly sessionTitle: string;
  readonly objective: string | null;
  readonly estimatedMinutes: number;
  readonly createdAt: Date;
  readonly chunkContents: ReadonlyArray<string>;
}): Promise<SessionBlueprintType> {
  const openai = requireOpenAi();

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt({
    sessionType: input.sessionType,
    planTitle: input.planTitle,
    moduleTitle: input.moduleTitle,
    sessionTitle: input.sessionTitle,
    objective: input.objective,
    estimatedMinutes: input.estimatedMinutes,
    chunkContents: input.chunkContents,
  });

  const tryGenerate = async (extraInstructions: string | null) => {
    const instructions = extraInstructions
      ? `${systemPrompt}\n\n${extraInstructions}`
      : systemPrompt;

    const response = await openai.responses.parse({
      model: CONFIG.OPENAI_CHAT_MODEL,
      instructions,
      input: userPrompt,
      text: {
        format: zodTextFormat(
          AiSessionBlueprintSpecSchema,
          "session_blueprint",
        ),
      },
    });

    if (!response.output_parsed) {
      throw new ApiError(
        500,
        "AI_GENERATION_FAILED",
        "AI 응답을 파싱할 수 없습니다. (세션 블루프린트)",
      );
    }

    return response.output_parsed;
  };

  const spec = (await tryGenerate(null).catch(async (err) => {
    logger.warn(
      { err: String(err) },
      "[generateSessionBlueprintWithAi] 1차 생성 실패, 재시도",
    );
    return tryGenerate(
      [
        "이전 응답이 스키마를 만족하지 못했습니다.",
        "반드시 제공된 JSON 스키마를 준수하고, placeholder/형식 예시는 절대 포함하지 마세요.",
        "LEARN_CONTENT는 충분한 분량의 마크다운으로 작성하세요.",
      ].join("\n"),
    );
  })) satisfies AiSessionBlueprintSpec;

  return buildBlueprintFromSpec({
    spec,
    planTitle: input.planTitle,
    moduleTitle: input.moduleTitle,
    sessionTitle: input.sessionTitle,
    estimatedMinutes: input.estimatedMinutes,
    createdAt: input.createdAt,
  });
}

function stepIdFor(type: AiSessionStepSpec["type"], index: number): string {
  if (type === "SESSION_INTRO") return "session-intro";
  if (type === "SESSION_SUMMARY") return "session-summary";
  const base = type.toLowerCase();
  return `${base}-${index}`;
}

function defaultIntentFor(
  type: AiSessionStepSpec["type"],
): "INTRO" | "EXPLAIN" | "RETRIEVAL" | "PRACTICE" | "WRAPUP" {
  switch (type) {
    case "SESSION_INTRO":
      return "INTRO";
    case "LEARN_CONTENT":
      return "EXPLAIN";
    case "SESSION_SUMMARY":
      return "WRAPUP";
    case "CHECK":
    case "CLOZE":
    case "FLASHCARD":
    case "SPEED_OX":
    case "MATCHING":
      return "RETRIEVAL";
    case "APPLICATION":
      return "PRACTICE";
  }
}

function estimateSecondsFor(type: AiSessionStepSpec["type"]): number {
  switch (type) {
    case "SESSION_INTRO":
      return 45;
    case "LEARN_CONTENT":
      return 120;
    case "CHECK":
    case "CLOZE":
    case "SPEED_OX":
      return 90;
    case "FLASHCARD":
      return 120;
    case "MATCHING":
      return 150;
    case "APPLICATION":
      return 4 * 60;
    case "SESSION_SUMMARY":
      return 60;
  }
}

function buildBlueprintFromSpec(input: {
  readonly spec: AiSessionBlueprintSpec;
  readonly planTitle: string;
  readonly moduleTitle: string;
  readonly sessionTitle: string;
  readonly estimatedMinutes: number;
  readonly createdAt: Date;
}): SessionBlueprintType {
  const steps: Array<SessionStep> = input.spec.steps.map((step, rawIndex) => {
    const id = stepIdFor(step.type, rawIndex);
    const estimatedSeconds = estimateSecondsFor(step.type);
    const intent = defaultIntentFor(step.type);

    if (step.type === "SESSION_INTRO") {
      return {
        id,
        type: "SESSION_INTRO",
        planTitle: input.planTitle,
        moduleTitle: input.moduleTitle,
        sessionTitle: input.sessionTitle,
        durationMinutes: input.estimatedMinutes,
        difficulty: step.difficulty,
        learningGoals: step.learningGoals,
        questionsToCover: step.questionsToCover,
        prerequisites: step.prerequisites,
        estimatedSeconds,
        intent,
      };
    }

    if (step.type === "LEARN_CONTENT") {
      return {
        id,
        type: "LEARN_CONTENT",
        title: step.title,
        contentMd: step.contentMd,
        estimatedSeconds,
        intent,
      };
    }

    if (step.type === "CHECK") {
      return {
        id,
        type: "CHECK",
        question: step.question,
        options: step.options,
        answerIndex: step.answerIndex,
        explanation: step.explanation,
        estimatedSeconds,
        intent,
      };
    }

    if (step.type === "CLOZE") {
      return {
        id,
        type: "CLOZE",
        sentence: step.sentence,
        blankId: `blank-${rawIndex}`,
        options: step.options,
        answerIndex: step.answerIndex,
        explanation: step.explanation,
        estimatedSeconds,
        intent,
      };
    }

    if (step.type === "MATCHING") {
      return {
        id,
        type: "MATCHING",
        instruction: step.instruction,
        pairs: step.pairs.map((pair, pairIndex) => ({
          id: `${id}-pair-${pairIndex + 1}`,
          left: pair.left,
          right: pair.right,
        })),
        estimatedSeconds,
        intent,
      };
    }

    if (step.type === "FLASHCARD") {
      return {
        id,
        type: "FLASHCARD",
        front: step.front,
        back: step.back,
        estimatedSeconds,
        intent,
      };
    }

    if (step.type === "SPEED_OX") {
      return {
        id,
        type: "SPEED_OX",
        statement: step.statement,
        isTrue: step.isTrue,
        explanation: step.explanation,
        estimatedSeconds,
        intent,
      };
    }

    if (step.type === "APPLICATION") {
      return {
        id,
        type: "APPLICATION",
        scenario: step.scenario,
        question: step.question,
        options: step.options,
        correctIndex: step.correctIndex,
        feedback: step.feedback,
        estimatedSeconds,
        intent,
      };
    }

    return {
      id,
      type: "SESSION_SUMMARY",
      celebrationEmoji: step.celebrationEmoji ?? "🎉",
      encouragement: step.encouragement,
      studyTimeMinutes: null,
      completedActivities: step.completedActivities,
      keyTakeaways: step.keyTakeaways,
      nextSessionPreview: step.nextSessionPreview,
      estimatedSeconds,
      intent,
    };
  });

  const blueprint = SessionBlueprint.parse({
    schemaVersion: 1,
    blueprintId: crypto.randomUUID(),
    createdAt: input.createdAt.toISOString(),
    steps,
    startStepIndex: 0,
  });

  return blueprint;
}
