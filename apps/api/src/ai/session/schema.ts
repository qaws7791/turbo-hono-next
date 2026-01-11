import { z } from "zod";

const DifficultySchema = z.enum(["beginner", "intermediate", "advanced"]);

const BaseStepSpecSchema = z.object({
  type: z.string(),
});

const IntroStepSpecSchema = BaseStepSpecSchema.extend({
  type: z.literal("SESSION_INTRO"),
  difficulty: DifficultySchema.describe("세션 난이도"),
  learningGoals: z
    .array(z.string().min(1).max(200))
    .min(1)
    .max(5)
    .describe("학습 목표 (측정 가능, 최대 5개)"),
  questionsToCover: z
    .array(z.string().min(1).max(200))
    .min(1)
    .max(5)
    .describe("세션에서 다룰 질문 (최대 5개)"),
  prerequisites: z
    .array(z.string().min(1).max(100))
    .max(5)
    .default([])
    .describe("사전 지식/준비물 (없으면 빈 배열)"),
});

const LearnContentStepSpecSchema = BaseStepSpecSchema.extend({
  type: z.literal("LEARN_CONTENT"),
  title: z.string().min(1).max(120),
  contentMd: z
    .string()
    .min(800)
    .max(10_000)
    .describe("개념 설명 마크다운 (충분한 분량)"),
});

const CheckStepSpecSchema = BaseStepSpecSchema.extend({
  type: z.literal("CHECK"),
  question: z.string().min(1).max(500),
  options: z.array(z.string().min(1).max(200)).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string().max(500).nullable(),
}).superRefine((value, ctx) => {
  const unique = new Set(value.options.map((opt) => opt.trim()));
  if (unique.size !== value.options.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "options는 중복 없이 4개여야 합니다.",
      path: ["options"],
    });
  }
});

const ClozeStepSpecSchema = BaseStepSpecSchema.extend({
  type: z.literal("CLOZE"),
  sentence: z
    .string()
    .min(1)
    .max(500)
    .describe("빈칸은 {{blank}} 같은 형태로 표시"),
  options: z.array(z.string().min(1).max(100)).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string().max(500).nullable(),
}).superRefine((value, ctx) => {
  if (!/\{\{[^}]+\}\}/.test(value.sentence)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "sentence에는 {{...}} 형태의 빈칸 표시가 필요합니다.",
      path: ["sentence"],
    });
  }
  const unique = new Set(value.options.map((opt) => opt.trim()));
  if (unique.size !== value.options.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "options는 중복 없이 4개여야 합니다.",
      path: ["options"],
    });
  }
});

const MatchingStepSpecSchema = BaseStepSpecSchema.extend({
  type: z.literal("MATCHING"),
  instruction: z.string().min(1).max(200),
  pairs: z
    .array(
      z.object({
        left: z.string().min(1).max(100),
        right: z.string().min(1).max(100),
      }),
    )
    .min(2)
    .max(6),
});

const FlashcardStepSpecSchema = BaseStepSpecSchema.extend({
  type: z.literal("FLASHCARD"),
  front: z.string().min(1).max(500),
  back: z.string().min(1).max(1_000),
});

const SpeedOxStepSpecSchema = BaseStepSpecSchema.extend({
  type: z.literal("SPEED_OX"),
  statement: z.string().min(1).max(300),
  isTrue: z.boolean(),
  explanation: z.string().max(500).nullable(),
});

const ApplicationStepSpecSchema = BaseStepSpecSchema.extend({
  type: z.literal("APPLICATION"),
  scenario: z.string().min(1).max(1_000),
  question: z.string().min(1).max(500),
  options: z.array(z.string().min(1).max(300)).min(2).max(4),
  correctIndex: z.number().int().min(0).max(3),
  feedback: z.string().max(500).nullable(),
}).superRefine((value, ctx) => {
  if (value.correctIndex < 0 || value.correctIndex >= value.options.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "correctIndex는 options 범위 안이어야 합니다.",
      path: ["correctIndex"],
    });
  }
  const unique = new Set(value.options.map((opt) => opt.trim()));
  if (unique.size !== value.options.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "options는 중복 없이 작성하세요.",
      path: ["options"],
    });
  }
});

const SummaryStepSpecSchema = BaseStepSpecSchema.extend({
  type: z.literal("SESSION_SUMMARY"),
  celebrationEmoji: z.string().min(1).max(10).nullable(),
  encouragement: z.string().min(1).max(200),
  completedActivities: z.array(z.string().min(1).max(100)).max(10).default([]),
  keyTakeaways: z.array(z.string().min(1).max(200)).min(1).max(5),
  nextSessionPreview: z
    .object({
      title: z.string().min(1).max(120),
      description: z.string().max(200).nullable(),
    })
    .nullable(),
});

export const AiSessionStepSpecSchema = z.discriminatedUnion("type", [
  IntroStepSpecSchema,
  LearnContentStepSpecSchema,
  CheckStepSpecSchema,
  ClozeStepSpecSchema,
  MatchingStepSpecSchema,
  FlashcardStepSpecSchema,
  SpeedOxStepSpecSchema,
  ApplicationStepSpecSchema,
  SummaryStepSpecSchema,
]);

export type AiSessionStepSpec = z.infer<typeof AiSessionStepSpecSchema>;

export const AiSessionBlueprintSpecSchema = z
  .object({
    steps: z.array(AiSessionStepSpecSchema).min(3).max(12),
  })
  .superRefine((value, ctx) => {
    const [first] = value.steps;
    const last = value.steps[value.steps.length - 1];

    if (!first || first.type !== "SESSION_INTRO") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "첫 번째 스텝은 SESSION_INTRO여야 합니다.",
        path: ["steps", 0, "type"],
      });
    }

    if (!last || last.type !== "SESSION_SUMMARY") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "마지막 스텝은 SESSION_SUMMARY여야 합니다.",
        path: ["steps", value.steps.length - 1, "type"],
      });
    }

    const hasLearnContent = value.steps.some((s) => s.type === "LEARN_CONTENT");
    if (!hasLearnContent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "LEARN_CONTENT 스텝이 최소 1개 필요합니다.",
        path: ["steps"],
      });
    }

    const hasInteractive = value.steps.some(
      (s) =>
        s.type !== "SESSION_INTRO" &&
        s.type !== "LEARN_CONTENT" &&
        s.type !== "SESSION_SUMMARY",
    );
    if (!hasInteractive) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "확인/실습용 스텝이 최소 1개 필요합니다.",
        path: ["steps"],
      });
    }
  });

export type AiSessionBlueprintSpec = z.infer<
  typeof AiSessionBlueprintSpecSchema
>;
