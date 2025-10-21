import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  aiNote as aiNoteTable,
  aiQuizResult as aiQuizResultTable,
  aiQuiz as aiQuizTable,
  goal as goalTable,
  roadmapDocument as roadmapDocumentTable,
  roadmap as roadmapTable,
  subGoal as subGoalTable,
} from "@repo/database/schema";

import { db } from "../../../database/client";
import { AIError } from "../errors";
import { generateSubGoalQuizPrompt } from "../prompts/subgoal-quiz-prompts";
import {
  SubGoalQuizSchema
} from "../schema";

import type {
  GenerateSubGoalQuizResponseSchema,
  SubGoalQuizSubmissionAnswerSchema} from "../schema";
import type { z } from "zod";
import type {
  DocumentSummary,
  FocusGoalInput,
  FocusSubGoalInput,
  RoadmapGoalSummary,
  RoadmapSummaryInput,
} from "../prompts/subgoal-note-prompts";

const MIN_QUIZ_QUESTIONS = 4;
const MAX_QUIZ_QUESTIONS = 20;

export const SUB_GOAL_QUIZ_STATUS = {
  idle: "idle",
  processing: "processing",
  ready: "ready",
  failed: "failed",
} as const;

export type SubGoalQuizStatus =
  (typeof SUB_GOAL_QUIZ_STATUS)[keyof typeof SUB_GOAL_QUIZ_STATUS];

export interface SubGoalQuizQuestion {
  id: string;
  prompt: string;
  options: Array<string>;
  answerIndex: number;
  explanation: string;
}

export interface SubGoalQuizRecord {
  id: number;
  subGoalId: number;
  status: SubGoalQuizStatus;
  targetQuestionCount: number;
  totalQuestions: number | null;
  requestedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
  questions: Array<SubGoalQuizQuestion> | null;
}

export interface SubGoalQuizResultRecord {
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

export interface SubGoalQuizGenerationJob {
  quizId: number;
  subGoalId: number;
  targetQuestionCount: number;
  promptInput: {
    roadmap: RoadmapSummaryInput;
    focusGoal: FocusGoalInput;
    focusSubGoal: FocusSubGoalInput & { summary: string | null };
    roadmapGoals: Array<RoadmapGoalSummary>;
    referencedDocuments: Array<DocumentSummary>;
    noteMarkdown: string | null;
    contextHighlights: Array<string>;
    contentWordCount: number;
  };
}

interface PrepareSubGoalQuizGenerationArgs {
  userId: string;
  roadmapPublicId: string;
  subGoalPublicId: string;
  force?: boolean;
}

interface PrepareSubGoalQuizGenerationResult {
  started: boolean;
  record: SubGoalQuizRecord;
  latestResult: SubGoalQuizResultRecord | null;
  job?: SubGoalQuizGenerationJob;
}

interface LoadLatestQuizArgs {
  subGoalDbId: number;
  userId: string;
}

type QuizSubmissionAnswer = z.infer<typeof SubGoalQuizSubmissionAnswerSchema>;
type SerializedQuiz = z.infer<typeof GenerateSubGoalQuizResponseSchema>;

interface SubmitQuizArgs {
  userId: string;
  roadmapPublicId: string;
  subGoalPublicId: string;
  quizId: number;
  answers: Array<QuizSubmissionAnswer>;
}

interface SubmitQuizResult {
  quiz: SubGoalQuizRecord;
  evaluation: SubGoalQuizResultRecord;
}

const QuizQuestionsSchema = SubGoalQuizSchema.shape.questions;

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
  questions: Array<SubGoalQuizQuestion> | null,
): Array<SubGoalQuizQuestion> | null {
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

function parseStoredQuestions(value: unknown): Array<SubGoalQuizQuestion> | null {
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
  subGoalId: number;
  status: string | null;
  targetQuestionCount: number;
  totalQuestions: number | null;
  requestedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
  questions: unknown | null;
}): SubGoalQuizRecord {
  const status = Object.values(SUB_GOAL_QUIZ_STATUS).includes(
    (row.status ?? "") as SubGoalQuizStatus,
  )
    ? ((row.status as SubGoalQuizStatus) ?? SUB_GOAL_QUIZ_STATUS.idle)
    : SUB_GOAL_QUIZ_STATUS.idle;

  return {
    id: row.id,
    subGoalId: row.subGoalId,
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
}): SubGoalQuizResultRecord | null {
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
    .replace(/[#>*_\-]/g, "")
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

async function loadRoadmapStructure(roadmapId: number) {
  const rows = await db
    .select({
      goalDbId: goalTable.id,
      goalTitle: goalTable.title,
      goalDescription: goalTable.description,
      goalOrder: goalTable.order,
      subGoalTitle: subGoalTable.title,
      subGoalDescription: subGoalTable.description,
      subGoalOrder: subGoalTable.order,
      subGoalIsCompleted: subGoalTable.isCompleted,
    })
    .from(goalTable)
    .leftJoin(subGoalTable, eq(goalTable.id, subGoalTable.goalId))
    .where(eq(goalTable.roadmapId, roadmapId))
    .orderBy(asc(goalTable.order), asc(subGoalTable.order));

  const goalMap = new Map<number, RoadmapGoalSummary>();

  for (const row of rows) {
    if (!goalMap.has(row.goalDbId)) {
      goalMap.set(row.goalDbId, {
        title: row.goalTitle,
        description: row.goalDescription,
        order: row.goalOrder,
        subGoals: [],
      });
    }

    if (row.subGoalTitle && row.subGoalOrder !== null) {
      goalMap.get(row.goalDbId)?.subGoals.push({
        title: row.subGoalTitle,
        description: row.subGoalDescription,
        order: row.subGoalOrder,
        isCompleted: !!row.subGoalIsCompleted,
      });
    }
  }

  return Array.from(goalMap.values()).sort((a, b) => a.order - b.order);
}

async function loadReferencedDocuments(roadmapId: number): Promise<{
  documents: Array<DocumentSummary>;
}> {
  const docs = await db
    .select({
      fileName: roadmapDocumentTable.fileName,
      fileType: roadmapDocumentTable.fileType,
    })
    .from(roadmapDocumentTable)
    .where(eq(roadmapDocumentTable.roadmapId, roadmapId))
    .orderBy(desc(roadmapDocumentTable.uploadedAt))
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
): Promise<SubGoalQuizResultRecord | null> {
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
  record: SubGoalQuizRecord;
  latestResult: SubGoalQuizResultRecord | null;
} | null> {
  const [row] = await db
    .select({
      id: aiQuizTable.id,
      subGoalId: aiQuizTable.subGoalId,
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

export async function loadLatestQuizForSubGoal(
  args: LoadLatestQuizArgs,
): Promise<{
  record: SubGoalQuizRecord;
  latestResult: SubGoalQuizResultRecord | null;
} | null> {
  const [row] = await db
    .select({
      id: aiQuizTable.id,
      subGoalId: aiQuizTable.subGoalId,
      status: aiQuizTable.status,
      targetQuestionCount: aiQuizTable.targetQuestionCount,
      totalQuestions: aiQuizTable.totalQuestions,
      requestedAt: aiQuizTable.requestedAt,
      completedAt: aiQuizTable.completedAt,
      errorMessage: aiQuizTable.errorMessage,
      questions: aiQuizTable.questions,
    })
    .from(aiQuizTable)
    .where(eq(aiQuizTable.subGoalId, args.subGoalDbId))
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

export async function prepareSubGoalQuizGeneration(
  args: PrepareSubGoalQuizGenerationArgs,
): Promise<PrepareSubGoalQuizGenerationResult> {
  const { userId, roadmapPublicId, subGoalPublicId, force } = args;

  const [subGoalRow] = await db
    .select({
      subGoalDbId: subGoalTable.id,
      subGoalPublicId: subGoalTable.publicId,
      subGoalTitle: subGoalTable.title,
      subGoalDescription: subGoalTable.description,
      subGoalMemo: subGoalTable.memo,
      subGoalOrder: subGoalTable.order,
      subGoalDueDate: subGoalTable.dueDate,
      goalDbId: goalTable.id,
      goalPublicId: goalTable.publicId,
      goalTitle: goalTable.title,
      goalDescription: goalTable.description,
      goalOrder: goalTable.order,
      roadmapDbId: roadmapTable.id,
      roadmapPublicId: roadmapTable.publicId,
      roadmapTitle: roadmapTable.title,
      roadmapDescription: roadmapTable.description,
      roadmapUserId: roadmapTable.userId,
      roadmapLearningTopic: roadmapTable.learningTopic,
      roadmapUserLevel: roadmapTable.userLevel,
      roadmapTargetWeeks: roadmapTable.targetWeeks,
      roadmapWeeklyHours: roadmapTable.weeklyHours,
      roadmapLearningStyle: roadmapTable.learningStyle,
      roadmapPreferredResources: roadmapTable.preferredResources,
      roadmapMainGoal: roadmapTable.mainGoal,
      roadmapAdditionalRequirements: roadmapTable.additionalRequirements,
      noteMarkdown: aiNoteTable.markdown,
    })
    .from(subGoalTable)
    .innerJoin(goalTable, eq(subGoalTable.goalId, goalTable.id))
    .innerJoin(roadmapTable, eq(goalTable.roadmapId, roadmapTable.id))
    .leftJoin(aiNoteTable, eq(aiNoteTable.subGoalId, subGoalTable.id))
    .where(
      and(
        eq(subGoalTable.publicId, subGoalPublicId),
        eq(roadmapTable.publicId, roadmapPublicId),
      ),
    )
    .limit(1);

  if (!subGoalRow) {
    throw new AIError(404, "ai:subgoal_not_found", "Sub-goal not found");
  }

  if (subGoalRow.roadmapUserId !== userId) {
    throw new AIError(403, "ai:access_denied", "Access denied to this roadmap");
  }

  const latestQuiz = await loadLatestQuizForSubGoal({
    subGoalDbId: subGoalRow.subGoalDbId,
    userId,
  });

  const isProcessing =
    latestQuiz?.record.status === SUB_GOAL_QUIZ_STATUS.processing;
  const hasReadyQuiz =
    latestQuiz?.record.status === SUB_GOAL_QUIZ_STATUS.ready &&
    latestQuiz.record.questions?.length;

  if (!force && (isProcessing || hasReadyQuiz)) {
    return {
      started: false,
      record: latestQuiz!.record,
      latestResult: latestQuiz?.latestResult ?? null,
    };
  }

  const descriptionLength = (subGoalRow.subGoalDescription ?? "").length;
  const noteLength = (subGoalRow.noteMarkdown ?? "").length;
  const memoLength = (subGoalRow.subGoalMemo ?? "").length;
  const targetQuestionCount = computeTargetQuestionCount(
    descriptionLength,
    noteLength,
    memoLength,
  );

  const now = new Date();

  const [insertedQuiz] = await db
    .insert(aiQuizTable)
    .values({
      subGoalId: subGoalRow.subGoalDbId,
      status: SUB_GOAL_QUIZ_STATUS.processing,
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
      subGoalId: aiQuizTable.subGoalId,
      status: aiQuizTable.status,
      targetQuestionCount: aiQuizTable.targetQuestionCount,
      totalQuestions: aiQuizTable.totalQuestions,
      requestedAt: aiQuizTable.requestedAt,
      completedAt: aiQuizTable.completedAt,
      errorMessage: aiQuizTable.errorMessage,
      questions: aiQuizTable.questions,
    });

  await db
    .update(subGoalTable)
    .set({ updatedAt: now })
    .where(eq(subGoalTable.id, subGoalRow.subGoalDbId));

  const roadmapGoals = await loadRoadmapStructure(subGoalRow.roadmapDbId);
  const documents = await loadReferencedDocuments(subGoalRow.roadmapDbId);
  const hasNote = Boolean(subGoalRow.noteMarkdown);
  const contentWordCount = Math.round(
    (
      (subGoalRow.noteMarkdown ?? "") +
      " " +
      (subGoalRow.subGoalDescription ?? "") +
      " " +
      (subGoalRow.subGoalMemo ?? "")
    )
      .split(/\s+/)
      .filter(Boolean).length,
  );

  const contextHighlights = buildContextHighlights({
    weeklyHours: subGoalRow.roadmapWeeklyHours,
    targetWeeks: subGoalRow.roadmapTargetWeeks,
    hasNote,
    descriptionLength,
    noteLength,
  });

  const record = mapQuizRow(insertedQuiz);

  const job: SubGoalQuizGenerationJob = {
    quizId: insertedQuiz.id,
    subGoalId: subGoalRow.subGoalDbId,
    targetQuestionCount,
    promptInput: {
      roadmap: {
        title: subGoalRow.roadmapTitle,
        description: subGoalRow.roadmapDescription,
        learningTopic: subGoalRow.roadmapLearningTopic,
        userLevel: subGoalRow.roadmapUserLevel,
        targetWeeks: subGoalRow.roadmapTargetWeeks,
        weeklyHours: subGoalRow.roadmapWeeklyHours,
        learningStyle: subGoalRow.roadmapLearningStyle,
        preferredResources: subGoalRow.roadmapPreferredResources,
        mainGoal: subGoalRow.roadmapMainGoal,
        additionalRequirements: subGoalRow.roadmapAdditionalRequirements,
      },
      focusGoal: {
        title: subGoalRow.goalTitle,
        description: subGoalRow.goalDescription,
        order: subGoalRow.goalOrder,
      },
      focusSubGoal: {
        title: subGoalRow.subGoalTitle,
        description: subGoalRow.subGoalDescription,
        order: subGoalRow.subGoalOrder,
        memo: subGoalRow.subGoalMemo,
        dueDateLabel: subGoalRow.subGoalDueDate
          ? new Intl.DateTimeFormat("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(subGoalRow.subGoalDueDate)
          : "기한 미정",
        summary: summarizeMarkdown(subGoalRow.noteMarkdown),
      },
      roadmapGoals,
      referencedDocuments: documents.documents,
      noteMarkdown: subGoalRow.noteMarkdown,
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

export async function runSubGoalQuizGeneration(
  job: SubGoalQuizGenerationJob,
): Promise<void> {
  const prompt = generateSubGoalQuizPrompt({
    roadmap: job.promptInput.roadmap,
    focusGoal: job.promptInput.focusGoal,
    focusSubGoal: job.promptInput.focusSubGoal,
    roadmapGoals: job.promptInput.roadmapGoals,
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
      schema: SubGoalQuizSchema,
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
      throw new AIError(
        500,
        "ai:quiz_generation_failed",
        "Failed to generate enough quiz questions",
      );
    }

    const completedAt = new Date();

    await db
      .update(aiQuizTable)
      .set({
        status: SUB_GOAL_QUIZ_STATUS.ready,
        questions,
        totalQuestions: questions.length,
        completedAt,
        errorMessage: null,
        updatedAt: completedAt,
      })
      .where(eq(aiQuizTable.id, job.quizId));

    await db
      .update(subGoalTable)
      .set({ updatedAt: completedAt })
      .where(eq(subGoalTable.id, job.subGoalId));
  } catch (error) {
    console.error("Sub-goal quiz generation failed:", error);
    const failureTime = new Date();
    const message =
      error instanceof AIError
        ? error.message
        : error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";

    await db
      .update(aiQuizTable)
      .set({
        status: SUB_GOAL_QUIZ_STATUS.failed,
        errorMessage: message.slice(0, 500),
        completedAt: failureTime,
        updatedAt: failureTime,
      })
      .where(eq(aiQuizTable.id, job.quizId));

    await db
      .update(subGoalTable)
      .set({ updatedAt: failureTime })
      .where(eq(subGoalTable.id, job.subGoalId));
  }
}

export async function submitSubGoalQuiz(
  args: SubmitQuizArgs,
): Promise<SubmitQuizResult> {
  const { userId, roadmapPublicId, subGoalPublicId, quizId, answers } = args;

  if (!answers.length) {
    throw new AIError(
      400,
      "ai:quiz_answers_required",
      "퀴즈 답안이 필요합니다.",
    );
  }

  const [quizRow] = await db
    .select({
      quizId: aiQuizTable.id,
      subGoalId: subGoalTable.id,
      quizStatus: aiQuizTable.status,
      quizQuestions: aiQuizTable.questions,
      quizTotalQuestions: aiQuizTable.totalQuestions,
      targetQuestionCount: aiQuizTable.targetQuestionCount,
      roadmapId: roadmapTable.id,
      goalId: goalTable.id,
      ownerId: roadmapTable.userId,
    })
    .from(aiQuizTable)
    .innerJoin(subGoalTable, eq(aiQuizTable.subGoalId, subGoalTable.id))
    .innerJoin(goalTable, eq(subGoalTable.goalId, goalTable.id))
    .innerJoin(roadmapTable, eq(goalTable.roadmapId, roadmapTable.id))
    .where(
      and(
        eq(aiQuizTable.id, quizId),
        eq(roadmapTable.publicId, roadmapPublicId),
        eq(subGoalTable.publicId, subGoalPublicId),
      ),
    )
    .limit(1);

  if (!quizRow) {
    throw new AIError(404, "ai:quiz_not_found", "퀴즈를 찾을 수 없습니다.");
  }

  if (quizRow.ownerId !== userId) {
    throw new AIError(
      403,
      "ai:quiz_access_denied",
      "이 퀴즈에 접근할 권한이 없습니다.",
    );
  }

  if (quizRow.quizStatus !== SUB_GOAL_QUIZ_STATUS.ready) {
    throw new AIError(
      409,
      "ai:quiz_not_ready",
      "퀴즈가 아직 준비되지 않았습니다.",
    );
  }

  const questions = parseStoredQuestions(quizRow.quizQuestions);

  if (!questions || !questions.length) {
    throw new AIError(
      500,
      "ai:quiz_missing_questions",
      "저장된 퀴즈 문항이 없습니다.",
    );
  }

  const totalQuestions = questions.length;

  if (answers.length !== totalQuestions) {
    throw new AIError(
      400,
      "ai:quiz_incomplete_answers",
      "모든 문항에 답변해야 결과를 저장할 수 있습니다.",
    );
  }

  const answerMap = new Map(
    answers.map((answer) => [answer.questionId, answer.selectedIndex]),
  );

  if (answerMap.size !== answers.length) {
    throw new AIError(
      400,
      "ai:quiz_duplicate_answers",
      "동일한 문항에 대한 답변이 중복되었습니다.",
    );
  }

  const evaluationAnswers = questions.map((question) => {
    if (!answerMap.has(question.id)) {
      throw new AIError(
        400,
        "ai:quiz_missing_answer",
        "일부 문항 답변이 누락되었습니다.",
      );
    }

    const selectedIndex = answerMap.get(question.id)!;

    if (
      typeof selectedIndex !== "number" ||
      selectedIndex < 0 ||
      selectedIndex >= question.options.length
    ) {
      throw new AIError(
        400,
        "ai:quiz_invalid_option",
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

  await db
    .update(aiQuizTable)
    .set({ updatedAt: submittedAt })
    .where(eq(aiQuizTable.id, quizId));

  const evaluation = mapResultRow(storedResult);
  if (!evaluation) {
    throw new AIError(
      500,
      "ai:quiz_result_store_failed",
      "퀴즈 결과 저장에 실패했습니다.",
    );
  }

  const quizData = await loadQuizById(quizId, userId);
  if (!quizData) {
    throw new AIError(
      500,
      "ai:quiz_load_failed",
      "저장된 퀴즈를 불러오지 못했습니다.",
    );
  }

  return {
    quiz: quizData.record,
    evaluation,
  };
}

export function serializeQuizRecord(
  record: SubGoalQuizRecord,
  latestResult: SubGoalQuizResultRecord | null,
): SerializedQuiz {
  const totalQuestions =
    record.totalQuestions ??
    (record.questions ? record.questions.length : null);

  const questions =
    record.status === SUB_GOAL_QUIZ_STATUS.ready && record.questions
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
