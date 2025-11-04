import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  aiNote as aiNoteTable,
  aiQuizResult as aiQuizResultTable,
  aiQuiz as aiQuizTable,
  learningModule as learningModuleTable,
  learningPlanDocument as learningPlanDocumentTable,
  learningPlan as learningPlanTable,
  learningTask as learningTaskTable,
} from "@repo/database/schema";

import { db } from "../../../database/client";
import { BaseError } from "../../../errors/base.error";
import { ErrorCodes } from "../../../errors/error-codes";
import { AIErrors } from "../errors";
import { generateLearningTaskQuizPrompt } from "../prompts/learning-task-quiz-prompts";
import { LearningTaskQuizSchema } from "../schema";

import type {
  GenerateLearningTaskQuizResponseSchema,
  LearningTaskQuizSubmissionAnswerSchema,
} from "../schema";
import type { z } from "zod";
import type {
  DocumentSummary,
  FocusLearningModuleInput,
  FocusLearningTaskInput,
  LearningPlanLearningModuleSummary,
  LearningPlanSummaryInput,
} from "../prompts/learning-task-note-prompts";

const MIN_QUIZ_QUESTIONS = 4;
const MAX_QUIZ_QUESTIONS = 20;

export const LEARNING_TASK_QUIZ_STATUS = {
  idle: "idle",
  processing: "processing",
  ready: "ready",
  failed: "failed",
} as const;

export type LearningTaskQuizStatus =
  (typeof LEARNING_TASK_QUIZ_STATUS)[keyof typeof LEARNING_TASK_QUIZ_STATUS];

export interface LearningTaskQuizQuestion {
  id: string;
  prompt: string;
  options: Array<string>;
  answerIndex: number;
  explanation: string;
}

export interface LearningTaskQuizRecord {
  id: number;
  learningTaskId: number;
  status: LearningTaskQuizStatus;
  targetQuestionCount: number;
  totalQuestions: number | null;
  requestedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
  questions: Array<LearningTaskQuizQuestion> | null;
}

export interface LearningTaskQuizResultRecord {
  id: number;
  quizId: number;
  userId: string;
  totalQuestions: number;
  correctCount: number;
  answers: Array<{
    questionId: string;
    prompt: string;
    options: Array<string>;
    selectedIndex: number;
    correctIndex: number;
    explanation: string;
    isCorrect: boolean;
  }>;
  submittedAt: Date;
}

export interface LearningTaskQuizGenerationJob {
  quizId: number;
  learningTaskId: number;
  targetQuestionCount: number;
  promptInput: {
    learningPlan: LearningPlanSummaryInput;
    focusLearningModule: FocusLearningModuleInput;
    focusLearningTask: FocusLearningTaskInput & { summary: string | null };
    learningPlanLearningModules: Array<LearningPlanLearningModuleSummary>;
    referencedDocuments: Array<DocumentSummary>;
    noteMarkdown: string | null;
    contextHighlights: Array<string>;
    contentWordCount: number;
  };
}

interface PrepareLearningTaskQuizGenerationArgs {
  userId: string;
  learningPlanPublicId: string;
  learningTaskPublicId: string;
  force?: boolean;
}

interface PrepareLearningTaskQuizGenerationResult {
  started: boolean;
  record: LearningTaskQuizRecord;
  latestResult: LearningTaskQuizResultRecord | null;
  job?: LearningTaskQuizGenerationJob;
}

interface LoadLatestQuizArgs {
  learningTaskDbId: number;
  userId: string;
}

type QuizSubmissionAnswer = z.infer<
  typeof LearningTaskQuizSubmissionAnswerSchema
>;
type SerializedQuiz = z.infer<typeof GenerateLearningTaskQuizResponseSchema>;

interface SubmitQuizArgs {
  userId: string;
  learningPlanPublicId: string;
  learningTaskPublicId: string;
  quizId: number;
  answers: Array<QuizSubmissionAnswer>;
}

interface SubmitQuizResult {
  quiz: LearningTaskQuizRecord;
  evaluation: LearningTaskQuizResultRecord;
}

const QuizQuestionsSchema = LearningTaskQuizSchema.shape.questions;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function computeTargetQuestionCount(
  descriptionLength: number,
  noteLength: number,
  memoLength: number,
): number {
  const base = MIN_QUIZ_QUESTIONS;
  const descriptionBonus = Math.floor(descriptionLength / 200);
  const noteBonus = Math.floor(noteLength / 1200);
  const memoBonus = memoLength > 120 ? 1 : 0;
  const raw = base + descriptionBonus + noteBonus + memoBonus;
  return clamp(raw, MIN_QUIZ_QUESTIONS, MAX_QUIZ_QUESTIONS);
}

function normalizeQuestions(
  questions: Array<LearningTaskQuizQuestion> | null,
): Array<LearningTaskQuizQuestion> | null {
  if (!questions) {
    return null;
  }

  return questions.map((question, index) => {
    const prompt = question.prompt.trim();
    const options = question.options.map((option) => option.trim());
    const sanitizedId = question.id.trim() || `q${index + 1}`;
    const answerIndex = clamp(question.answerIndex, 0, options.length - 1);
    const explanation = question.explanation.trim();

    return {
      id: sanitizedId,
      prompt,
      options,
      answerIndex,
      explanation,
    };
  });
}

function parseStoredQuestions(
  value: unknown,
): Array<LearningTaskQuizQuestion> | null {
  if (!value) {
    return null;
  }

  const parsed = QuizQuestionsSchema.safeParse(value);
  if (!parsed.success) {
    console.warn("Failed to parse stored quiz questions:", parsed.error);
    return null;
  }

  return normalizeQuestions(parsed.data);
}

function mapQuizRow(row: {
  id: number;
  learningTaskId: number;
  status: string | null;
  targetQuestionCount: number;
  totalQuestions: number | null;
  requestedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
  questions: unknown | null;
}): LearningTaskQuizRecord {
  const status = Object.values(LEARNING_TASK_QUIZ_STATUS).includes(
    (row.status ?? "") as LearningTaskQuizStatus,
  )
    ? ((row.status as LearningTaskQuizStatus) ?? LEARNING_TASK_QUIZ_STATUS.idle)
    : LEARNING_TASK_QUIZ_STATUS.idle;

  return {
    id: row.id,
    learningTaskId: row.learningTaskId,
    status,
    targetQuestionCount: row.targetQuestionCount,
    totalQuestions: row.totalQuestions,
    requestedAt: row.requestedAt,
    completedAt: row.completedAt,
    errorMessage: row.errorMessage,
    questions: parseStoredQuestions(row.questions),
  };
}

function mapResultRow(row: {
  id: number;
  quizId: number;
  userId: string;
  totalQuestions: number;
  correctCount: number;
  answers: unknown;
  submittedAt: Date;
}): LearningTaskQuizResultRecord | null {
  if (!row.answers || typeof row.answers !== "object") {
    return null;
  }

  const answersArray = Array.isArray(row.answers)
    ? row.answers
    : (row.answers as { answers?: unknown }).answers;

  if (!Array.isArray(answersArray)) {
    return null;
  }

  const answers = answersArray
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const questionId =
        typeof (item as { questionId?: unknown }).questionId === "string"
          ? (item as { questionId: string }).questionId
          : null;
      const prompt =
        typeof (item as { prompt?: unknown }).prompt === "string"
          ? (item as { prompt: string }).prompt
          : null;
      const options = Array.isArray((item as { options?: unknown }).options)
        ? ((item as { options: Array<unknown> }).options as Array<string>)
        : null;
      const selectedIndex =
        typeof (item as { selectedIndex?: unknown }).selectedIndex === "number"
          ? (item as { selectedIndex: number }).selectedIndex
          : null;
      const correctIndex =
        typeof (item as { correctIndex?: unknown }).correctIndex === "number"
          ? (item as { correctIndex: number }).correctIndex
          : null;
      const explanation =
        typeof (item as { explanation?: unknown }).explanation === "string"
          ? (item as { explanation: string }).explanation
          : null;
      const isCorrect =
        typeof (item as { isCorrect?: unknown }).isCorrect === "boolean"
          ? (item as { isCorrect: boolean }).isCorrect
          : selectedIndex === correctIndex;

      if (
        !questionId ||
        !prompt ||
        !options ||
        selectedIndex === null ||
        correctIndex === null ||
        !explanation
      ) {
        return null;
      }

      return {
        questionId,
        prompt,
        options,
        selectedIndex,
        correctIndex,
        explanation,
        isCorrect,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return {
    id: row.id,
    quizId: row.quizId,
    userId: row.userId,
    totalQuestions: row.totalQuestions,
    correctCount: row.correctCount,
    answers,
    submittedAt: row.submittedAt,
  };
}

function summarizeMarkdown(content: string | null): string | null {
  if (!content) {
    return null;
  }

  const plain = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[-#>*_]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) {
    return null;
  }

  return plain.slice(0, 320);
}

function buildContextHighlights(args: {
  weeklyHours: number;
  targetWeeks: number;
  hasNote: boolean;
  descriptionLength: number;
  noteLength: number;
}): Array<string> {
  const highlights: Array<string> = [];

  if (!args.hasNote) {
    highlights.push(
      "AI 학습 노트가 아직 없어 세부 목표 설명과 메모 중심으로 퀴즈를 구성해야 합니다.",
    );
  } else if (args.noteLength > 4000) {
    highlights.push(
      "학습 노트 분량이 많으므로 핵심 개념을 균형 있게 다뤄야 합니다.",
    );
  }

  if (args.descriptionLength < 80) {
    highlights.push(
      "세부 목표 설명이 짧으므로 노트 내용과 로드맵 맥락을 적극 활용하세요.",
    );
  }

  if (args.weeklyHours <= 5) {
    highlights.push(
      "사용자는 주당 학습 시간이 적으므로 실용적인 핵심 개념 위주를 선호합니다.",
    );
  }

  if (args.targetWeeks <= 4) {
    highlights.push(
      "학습 기간이 짧아 빠르게 이해할 수 있는 문항 구성이 필요합니다.",
    );
  }

  return highlights.slice(0, 4);
}

async function loadLearningPlanStructure(learningPlanId: number) {
  const rows = await db
    .select({
      learningModuleDbId: learningModuleTable.id,
      learningModuleTitle: learningModuleTable.title,
      learningModuleDescription: learningModuleTable.description,
      learningModuleOrder: learningModuleTable.order,
      learningTaskTitle: learningTaskTable.title,
      learningTaskDescription: learningTaskTable.description,
      learningTaskOrder: learningTaskTable.order,
      learningTaskIsCompleted: learningTaskTable.isCompleted,
    })
    .from(learningModuleTable)
    .leftJoin(
      learningTaskTable,
      eq(learningModuleTable.id, learningTaskTable.learningModuleId),
    )
    .where(eq(learningModuleTable.learningPlanId, learningPlanId))
    .orderBy(asc(learningModuleTable.order), asc(learningTaskTable.order));

  const learningModuleMap = new Map<
    number,
    LearningPlanLearningModuleSummary
  >();

  for (const row of rows) {
    if (!learningModuleMap.has(row.learningModuleDbId)) {
      learningModuleMap.set(row.learningModuleDbId, {
        title: row.learningModuleTitle,
        description: row.learningModuleDescription,
        order: row.learningModuleOrder,
        learningTasks: [],
      });
    }

    if (row.learningTaskTitle && row.learningTaskOrder !== null) {
      learningModuleMap.get(row.learningModuleDbId)?.learningTasks.push({
        title: row.learningTaskTitle,
        description: row.learningTaskDescription,
        order: row.learningTaskOrder,
        isCompleted: !!row.learningTaskIsCompleted,
      });
    }
  }

  return Array.from(learningModuleMap.values()).sort(
    (a, b) => a.order - b.order,
  );
}

async function loadReferencedDocuments(learningPlanId: number): Promise<{
  documents: Array<DocumentSummary>;
}> {
  const docs = await db
    .select({
      fileName: learningPlanDocumentTable.fileName,
      fileType: learningPlanDocumentTable.fileType,
    })
    .from(learningPlanDocumentTable)
    .where(eq(learningPlanDocumentTable.learningPlanId, learningPlanId))
    .orderBy(desc(learningPlanDocumentTable.uploadedAt))
    .limit(2);

  return {
    documents: docs.map((doc) => ({
      fileName: doc.fileName,
      originalFileType: doc.fileType,
    })),
  };
}

async function loadLatestResultForQuiz(
  quizId: number,
  userId: string,
): Promise<LearningTaskQuizResultRecord | null> {
  const [row] = await db
    .select({
      id: aiQuizResultTable.id,
      quizId: aiQuizResultTable.quizId,
      userId: aiQuizResultTable.userId,
      totalQuestions: aiQuizResultTable.totalQuestions,
      correctCount: aiQuizResultTable.correctCount,
      answers: aiQuizResultTable.answers,
      submittedAt: aiQuizResultTable.submittedAt,
    })
    .from(aiQuizResultTable)
    .where(
      and(
        eq(aiQuizResultTable.quizId, quizId),
        eq(aiQuizResultTable.userId, userId),
      ),
    )
    .orderBy(desc(aiQuizResultTable.submittedAt), desc(aiQuizResultTable.id))
    .limit(1);

  if (!row) {
    return null;
  }

  return mapResultRow(row);
}

async function loadQuizById(
  quizId: number,
  userId: string,
): Promise<{
  record: LearningTaskQuizRecord;
  latestResult: LearningTaskQuizResultRecord | null;
} | null> {
  const [row] = await db
    .select({
      id: aiQuizTable.id,
      learningTaskId: aiQuizTable.learningTaskId,
      status: aiQuizTable.status,
      targetQuestionCount: aiQuizTable.targetQuestionCount,
      totalQuestions: aiQuizTable.totalQuestions,
      requestedAt: aiQuizTable.requestedAt,
      completedAt: aiQuizTable.completedAt,
      errorMessage: aiQuizTable.errorMessage,
      questions: aiQuizTable.questions,
    })
    .from(aiQuizTable)
    .where(eq(aiQuizTable.id, quizId))
    .limit(1);

  if (!row) {
    return null;
  }

  const record = mapQuizRow(row);
  const latestResult = await loadLatestResultForQuiz(quizId, userId);

  return {
    record,
    latestResult,
  };
}

export async function loadLatestQuizForLearningTask(
  args: LoadLatestQuizArgs,
): Promise<{
  record: LearningTaskQuizRecord;
  latestResult: LearningTaskQuizResultRecord | null;
} | null> {
  const [row] = await db
    .select({
      id: aiQuizTable.id,
      learningTaskId: aiQuizTable.learningTaskId,
      status: aiQuizTable.status,
      targetQuestionCount: aiQuizTable.targetQuestionCount,
      totalQuestions: aiQuizTable.totalQuestions,
      requestedAt: aiQuizTable.requestedAt,
      completedAt: aiQuizTable.completedAt,
      errorMessage: aiQuizTable.errorMessage,
      questions: aiQuizTable.questions,
    })
    .from(aiQuizTable)
    .where(eq(aiQuizTable.learningTaskId, args.learningTaskDbId))
    .orderBy(
      desc(aiQuizTable.requestedAt),
      desc(aiQuizTable.completedAt),
      desc(aiQuizTable.id),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  const record = mapQuizRow(row);
  const latestResult = await loadLatestResultForQuiz(record.id, args.userId);

  return {
    record,
    latestResult,
  };
}

export async function prepareLearningTaskQuizGeneration(
  args: PrepareLearningTaskQuizGenerationArgs,
): Promise<PrepareLearningTaskQuizGenerationResult> {
  const { userId, learningPlanPublicId, learningTaskPublicId, force } = args;

  const [learningTaskRow] = await db
    .select({
      learningTaskDbId: learningTaskTable.id,
      learningTaskPublicId: learningTaskTable.publicId,
      learningTaskTitle: learningTaskTable.title,
      learningTaskDescription: learningTaskTable.description,
      learningTaskMemo: learningTaskTable.memo,
      learningTaskOrder: learningTaskTable.order,
      learningTaskDueDate: learningTaskTable.dueDate,
      learningModuleDbId: learningModuleTable.id,
      learningModulePublicId: learningModuleTable.publicId,
      learningModuleTitle: learningModuleTable.title,
      learningModuleDescription: learningModuleTable.description,
      learningModuleOrder: learningModuleTable.order,
      learningPlanDbId: learningPlanTable.id,
      learningPlanPublicId: learningPlanTable.publicId,
      learningPlanTitle: learningPlanTable.title,
      learningPlanDescription: learningPlanTable.description,
      learningPlanUserId: learningPlanTable.userId,
      learningPlanLearningTopic: learningPlanTable.learningTopic,
      learningPlanUserLevel: learningPlanTable.userLevel,
      learningPlanTargetWeeks: learningPlanTable.targetWeeks,
      learningPlanWeeklyHours: learningPlanTable.weeklyHours,
      learningPlanLearningStyle: learningPlanTable.learningStyle,
      learningPlanPreferredResources: learningPlanTable.preferredResources,
      learningPlanMainGoal: learningPlanTable.mainGoal,
      learningPlanAdditionalRequirements:
        learningPlanTable.additionalRequirements,
      noteMarkdown: aiNoteTable.markdown,
    })
    .from(learningTaskTable)
    .innerJoin(
      learningModuleTable,
      eq(learningTaskTable.learningModuleId, learningModuleTable.id),
    )
    .innerJoin(
      learningPlanTable,
      eq(learningModuleTable.learningPlanId, learningPlanTable.id),
    )
    .leftJoin(aiNoteTable, eq(aiNoteTable.learningTaskId, learningTaskTable.id))
    .where(
      and(
        eq(learningTaskTable.publicId, learningTaskPublicId),
        eq(learningPlanTable.publicId, learningPlanPublicId),
      ),
    )
    .limit(1);

  if (!learningTaskRow) {
    throw AIErrors.learningTaskNotFound();
  }

  if (learningTaskRow.learningPlanUserId !== userId) {
    throw AIErrors.accessDenied();
  }

  const latestQuiz = await loadLatestQuizForLearningTask({
    learningTaskDbId: learningTaskRow.learningTaskDbId,
    userId,
  });

  const isProcessing =
    latestQuiz?.record.status === LEARNING_TASK_QUIZ_STATUS.processing;
  const hasReadyQuiz =
    latestQuiz?.record.status === LEARNING_TASK_QUIZ_STATUS.ready &&
    latestQuiz.record.questions?.length;

  if (!force && (isProcessing || hasReadyQuiz)) {
    return {
      started: false,
      record: latestQuiz!.record,
      latestResult: latestQuiz?.latestResult ?? null,
    };
  }

  const descriptionLength = (learningTaskRow.learningTaskDescription ?? "")
    .length;
  const noteLength = (learningTaskRow.noteMarkdown ?? "").length;
  const memoLength = (learningTaskRow.learningTaskMemo ?? "").length;
  const targetQuestionCount = computeTargetQuestionCount(
    descriptionLength,
    noteLength,
    memoLength,
  );

  const now = new Date();

  const [insertedQuiz] = await db
    .insert(aiQuizTable)
    .values({
      learningTaskId: learningTaskRow.learningTaskDbId,
      status: LEARNING_TASK_QUIZ_STATUS.processing,
      targetQuestionCount,
      totalQuestions: null,
      requestedAt: now,
      completedAt: null,
      errorMessage: null,
      questions: null,
      createdAt: now,
      updatedAt: now,
    })
    .returning({
      id: aiQuizTable.id,
      learningTaskId: aiQuizTable.learningTaskId,
      status: aiQuizTable.status,
      targetQuestionCount: aiQuizTable.targetQuestionCount,
      totalQuestions: aiQuizTable.totalQuestions,
      requestedAt: aiQuizTable.requestedAt,
      completedAt: aiQuizTable.completedAt,
      errorMessage: aiQuizTable.errorMessage,
      questions: aiQuizTable.questions,
    });

  if (!insertedQuiz) {
    throw AIErrors.databaseError({ message: "퀴즈 요청 생성에 실패했습니다." });
  }

  await db
    .update(learningTaskTable)
    .set({ updatedAt: now })
    .where(eq(learningTaskTable.id, learningTaskRow.learningTaskDbId));

  const learningPlanLearningModules = await loadLearningPlanStructure(
    learningTaskRow.learningPlanDbId,
  );
  const documents = await loadReferencedDocuments(
    learningTaskRow.learningPlanDbId,
  );
  const hasNote = Boolean(learningTaskRow.noteMarkdown);
  const contentWordCount = Math.round(
    (
      (learningTaskRow.noteMarkdown ?? "") +
      " " +
      (learningTaskRow.learningTaskDescription ?? "") +
      " " +
      (learningTaskRow.learningTaskMemo ?? "")
    )
      .split(/\s+/)
      .filter(Boolean).length,
  );

  const contextHighlights = buildContextHighlights({
    weeklyHours: learningTaskRow.learningPlanWeeklyHours,
    targetWeeks: learningTaskRow.learningPlanTargetWeeks,
    hasNote,
    descriptionLength,
    noteLength,
  });

  const record = mapQuizRow(insertedQuiz);

  const job: LearningTaskQuizGenerationJob = {
    quizId: insertedQuiz.id,
    learningTaskId: learningTaskRow.learningTaskDbId,
    targetQuestionCount,
    promptInput: {
      learningPlan: {
        title: learningTaskRow.learningPlanTitle,
        description: learningTaskRow.learningPlanDescription,
        learningTopic: learningTaskRow.learningPlanLearningTopic,
        userLevel: learningTaskRow.learningPlanUserLevel,
        targetWeeks: learningTaskRow.learningPlanTargetWeeks,
        weeklyHours: learningTaskRow.learningPlanWeeklyHours,
        learningStyle: learningTaskRow.learningPlanLearningStyle,
        preferredResources: learningTaskRow.learningPlanPreferredResources,
        mainGoal: learningTaskRow.learningPlanMainGoal,
        additionalRequirements:
          learningTaskRow.learningPlanAdditionalRequirements,
      },
      focusLearningModule: {
        title: learningTaskRow.learningModuleTitle,
        description: learningTaskRow.learningModuleDescription,
        order: learningTaskRow.learningModuleOrder,
      },
      focusLearningTask: {
        title: learningTaskRow.learningTaskTitle,
        description: learningTaskRow.learningTaskDescription,
        order: learningTaskRow.learningTaskOrder,
        memo: learningTaskRow.learningTaskMemo,
        dueDateLabel: learningTaskRow.learningTaskDueDate
          ? new Intl.DateTimeFormat("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(learningTaskRow.learningTaskDueDate)
          : "기한 미정",
        summary: summarizeMarkdown(learningTaskRow.noteMarkdown),
      },
      learningPlanLearningModules,
      referencedDocuments: documents.documents,
      noteMarkdown: learningTaskRow.noteMarkdown,
      contextHighlights,
      contentWordCount,
    },
  };

  return {
    started: true,
    record,
    latestResult: null,
    job,
  };
}

export async function runLearningTaskQuizGeneration(
  job: LearningTaskQuizGenerationJob,
): Promise<void> {
  const prompt = generateLearningTaskQuizPrompt({
    learningPlan: job.promptInput.learningPlan,
    focusLearningModule: job.promptInput.focusLearningModule,
    focusLearningTask: job.promptInput.focusLearningTask,
    learningPlanLearningModules: job.promptInput.learningPlanLearningModules,
    referencedDocuments: job.promptInput.referencedDocuments,
    noteMarkdown: job.promptInput.noteMarkdown,
    targetQuestionCount: job.targetQuestionCount,
    minQuestions: MIN_QUIZ_QUESTIONS,
    maxQuestions: MAX_QUIZ_QUESTIONS,
    contentWordCount: job.promptInput.contentWordCount,
    contextHighlights: job.promptInput.contextHighlights,
  });

  try {
    const result = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      schema: LearningTaskQuizSchema,
      temperature: 0.4,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const questions = normalizeQuestions(result.object?.questions ?? null);

    if (!questions || questions.length < MIN_QUIZ_QUESTIONS) {
      throw AIErrors.quizGenerationFailed({
        message: "Failed to generate enough quiz questions",
      });
    }

    const completedAt = new Date();

    await db
      .update(aiQuizTable)
      .set({
        status: LEARNING_TASK_QUIZ_STATUS.ready,
        questions,
        totalQuestions: questions.length,
        completedAt,
        errorMessage: null,
        updatedAt: completedAt,
      })
      .where(eq(aiQuizTable.id, job.quizId));

    await db
      .update(learningTaskTable)
      .set({ updatedAt: completedAt })
      .where(eq(learningTaskTable.id, job.learningTaskId));
  } catch (error) {
    console.error("Learning-task quiz generation failed:", error);
    const failureTime = new Date();
    const message =
      error instanceof Error
        ? error.message
        : "알 수 없는 오류가 발생했습니다.";

    await db
      .update(aiQuizTable)
      .set({
        status: LEARNING_TASK_QUIZ_STATUS.failed,
        errorMessage: message.slice(0, 500),
        completedAt: failureTime,
        updatedAt: failureTime,
      })
      .where(eq(aiQuizTable.id, job.quizId));

    await db
      .update(learningTaskTable)
      .set({ updatedAt: failureTime })
      .where(eq(learningTaskTable.id, job.learningTaskId));
  }
}

export async function submitLearningTaskQuiz(
  args: SubmitQuizArgs,
): Promise<SubmitQuizResult> {
  const {
    userId,
    learningPlanPublicId,
    learningTaskPublicId,
    quizId,
    answers,
  } = args;

  if (!answers.length) {
    throw new BaseError(
      400,
      ErrorCodes.VALIDATION_INVALID_INPUT,
      "퀴즈 답안이 필요합니다.",
    );
  }

  const [quizRow] = await db
    .select({
      quizId: aiQuizTable.id,
      learningTaskId: learningTaskTable.id,
      quizStatus: aiQuizTable.status,
      quizQuestions: aiQuizTable.questions,
      quizTotalQuestions: aiQuizTable.totalQuestions,
      targetQuestionCount: aiQuizTable.targetQuestionCount,
      learningPlanId: learningPlanTable.id,
      learningModuleId: learningModuleTable.id,
      ownerId: learningPlanTable.userId,
    })
    .from(aiQuizTable)
    .innerJoin(
      learningTaskTable,
      eq(aiQuizTable.learningTaskId, learningTaskTable.id),
    )
    .innerJoin(
      learningModuleTable,
      eq(learningTaskTable.learningModuleId, learningModuleTable.id),
    )
    .innerJoin(
      learningPlanTable,
      eq(learningModuleTable.learningPlanId, learningPlanTable.id),
    )
    .where(
      and(
        eq(aiQuizTable.id, quizId),
        eq(learningPlanTable.publicId, learningPlanPublicId),
        eq(learningTaskTable.publicId, learningTaskPublicId),
      ),
    )
    .limit(1);

  if (!quizRow) {
    throw new BaseError(
      404,
      ErrorCodes.NOT_FOUND_RESOURCE,
      "퀴즈를 찾을 수 없습니다.",
    );
  }

  if (quizRow.ownerId !== userId) {
    throw AIErrors.accessDenied({
      message: "이 퀴즈에 접근할 권한이 없습니다.",
    });
  }

  if (quizRow.quizStatus !== LEARNING_TASK_QUIZ_STATUS.ready) {
    throw new BaseError(
      409,
      ErrorCodes.VALIDATION_INVALID_INPUT,
      "퀴즈가 아직 준비되지 않았습니다.",
    );
  }

  const questions = parseStoredQuestions(quizRow.quizQuestions);

  if (!questions || !questions.length) {
    throw AIErrors.databaseError({ message: "저장된 퀴즈 문항이 없습니다." });
  }

  const totalQuestions = questions.length;

  if (answers.length !== totalQuestions) {
    throw new BaseError(
      400,
      ErrorCodes.VALIDATION_INVALID_INPUT,
      "모든 문항에 답변해야 결과를 저장할 수 있습니다.",
    );
  }

  const answerMap = new Map(
    answers.map((answer) => [answer.questionId, answer.selectedIndex]),
  );

  if (answerMap.size !== answers.length) {
    throw new BaseError(
      400,
      ErrorCodes.VALIDATION_INVALID_INPUT,
      "동일한 문항에 대한 답변이 중복되었습니다.",
    );
  }

  const evaluationAnswers = questions.map((question) => {
    if (!answerMap.has(question.id)) {
      throw new BaseError(
        400,
        ErrorCodes.VALIDATION_INVALID_INPUT,
        "일부 문항 답변이 누락되었습니다.",
      );
    }

    const selectedIndex = answerMap.get(question.id)!;

    if (
      typeof selectedIndex !== "number" ||
      selectedIndex < 0 ||
      selectedIndex >= question.options.length
    ) {
      throw new BaseError(
        400,
        ErrorCodes.VALIDATION_INVALID_INPUT,
        "선택한 보기 정보가 올바르지 않습니다.",
      );
    }

    const isCorrect = selectedIndex === question.answerIndex;

    return {
      questionId: question.id,
      prompt: question.prompt,
      options: question.options,
      selectedIndex,
      correctIndex: question.answerIndex,
      explanation: question.explanation,
      isCorrect,
    };
  });

  const correctCount = evaluationAnswers.filter(
    (answer) => answer.isCorrect,
  ).length;

  const submittedAt = new Date();

  const [storedResult] = await db
    .insert(aiQuizResultTable)
    .values({
      quizId,
      userId,
      totalQuestions,
      correctCount,
      answers: evaluationAnswers,
      submittedAt,
      createdAt: submittedAt,
      updatedAt: submittedAt,
    })
    .returning({
      id: aiQuizResultTable.id,
      quizId: aiQuizResultTable.quizId,
      userId: aiQuizResultTable.userId,
      totalQuestions: aiQuizResultTable.totalQuestions,
      correctCount: aiQuizResultTable.correctCount,
      answers: aiQuizResultTable.answers,
      submittedAt: aiQuizResultTable.submittedAt,
    });

  if (!storedResult) {
    throw AIErrors.databaseError({ message: "퀴즈 결과 저장에 실패했습니다." });
  }

  await db
    .update(aiQuizTable)
    .set({ updatedAt: submittedAt })
    .where(eq(aiQuizTable.id, quizId));

  const evaluation = mapResultRow(storedResult);
  if (!evaluation) {
    throw AIErrors.databaseError({ message: "퀴즈 결과 저장에 실패했습니다." });
  }

  const quizData = await loadQuizById(quizId, userId);
  if (!quizData) {
    throw AIErrors.databaseError({
      message: "저장된 퀴즈를 불러오지 못했습니다.",
    });
  }

  return {
    quiz: quizData.record,
    evaluation,
  };
}

export function serializeQuizRecord(
  record: LearningTaskQuizRecord,
  latestResult: LearningTaskQuizResultRecord | null,
): SerializedQuiz {
  const totalQuestions =
    record.totalQuestions ??
    (record.questions ? record.questions.length : null);

  const questions =
    record.status === LEARNING_TASK_QUIZ_STATUS.ready && record.questions
      ? record.questions.map((question) => ({
          id: question.id,
          prompt: question.prompt,
          options: question.options,
        }))
      : null;

  const evaluation = latestResult
    ? {
        quizId: String(latestResult.quizId),
        totalQuestions: latestResult.totalQuestions,
        correctCount: latestResult.correctCount,
        scorePercent:
          latestResult.totalQuestions > 0
            ? Math.round(
                (latestResult.correctCount / latestResult.totalQuestions) * 100,
              )
            : 0,
        answers: latestResult.answers.map((answer) => ({
          id: answer.questionId,
          prompt: answer.prompt,
          options: answer.options,
          selectedIndex: answer.selectedIndex,
          correctIndex: answer.correctIndex,
          explanation: answer.explanation,
          isCorrect: answer.isCorrect,
        })),
        submittedAt: latestResult.submittedAt.toISOString(),
      }
    : null;

  return {
    id: String(record.id),
    status: record.status,
    targetQuestionCount: record.targetQuestionCount,
    totalQuestions,
    requestedAt: record.requestedAt?.toISOString() ?? null,
    completedAt: record.completedAt?.toISOString() ?? null,
    errorMessage: record.errorMessage,
    questions,
    latestResult: evaluation,
  };
}
