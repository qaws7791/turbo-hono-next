import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  aiNote as aiNoteTable,
  learningModule as learningModuleTable,
  learningPlanDocument as learningPlanDocumentTable,
  learningPlan as learningPlanTable,
  learningTask as learningTaskTable,
} from "@repo/database/schema";

import { db } from "../../../database/client";
import { AIErrors } from "../errors";
import { generateLearningTaskNotePrompt } from "../prompts/learning-task-note-prompts";
import { LearningTaskNoteContentSchema } from "../schema";

import type { LearningTaskNotePromptInput } from "../prompts/learning-task-note-prompts";
import type { ModelMessage } from "ai";

export const LEARNING_TASK_NOTE_STATUS = {
  idle: "idle",
  processing: "processing",
  ready: "ready",
  failed: "failed",
} as const;

export type LearningTaskNoteStatus =
  (typeof LEARNING_TASK_NOTE_STATUS)[keyof typeof LEARNING_TASK_NOTE_STATUS];

export interface LearningTaskNoteRecord {
  status: LearningTaskNoteStatus;
  markdown: string | null;
  requestedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
}

interface NoteDocumentFile {
  fileName: string;
  mediaType: string;
  buffer: Buffer;
}

export interface LearningTaskNoteGenerationJob {
  learningTaskDbId: number;
  promptInput: LearningTaskNotePromptInput;
  documentFiles: Array<NoteDocumentFile>;
}

interface PrepareLearningTaskNoteGenerationArgs {
  userId: string;
  learningPlanPublicId: string;
  learningTaskPublicId: string;
  force?: boolean;
}

interface PrepareLearningTaskNoteGenerationResult {
  started: boolean;
  record: LearningTaskNoteRecord;
  job?: LearningTaskNoteGenerationJob;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDueDateLabel(dueDate: Date | null): string {
  if (!dueDate) {
    return "기한 미정";
  }

  const formatted = DATE_FORMATTER.format(dueDate);
  const now = new Date();

  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `${formatted} (D-${diffDays})`;
  }

  if (diffDays === 0) {
    return `${formatted} (D-day)`;
  }

  return `${formatted} (지남)`;
}

function sanitizeErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return (error.message as string).slice(0, 500);
  }

  if (error instanceof Error) {
    return error.message.slice(0, 500);
  }

  return "알 수 없는 오류가 발생했습니다.";
}

function isLearningTaskNoteStatus(
  value: unknown,
): value is LearningTaskNoteStatus {
  return (
    typeof value === "string" &&
    (Object.values(LEARNING_TASK_NOTE_STATUS) as Array<string>).includes(
      value as LearningTaskNoteStatus,
    )
  );
}

function mapRecord(
  row?: {
    status: string | null;
    markdown: string | null;
    requestedAt: Date | null;
    completedAt: Date | null;
    errorMessage: string | null;
  } | null,
): LearningTaskNoteRecord {
  const status = isLearningTaskNoteStatus(row?.status)
    ? row?.status
    : LEARNING_TASK_NOTE_STATUS.idle;

  return {
    status,
    markdown: row?.markdown ?? null,
    requestedAt: row?.requestedAt ?? null,
    completedAt: row?.completedAt ?? null,
    errorMessage: row?.errorMessage ?? null,
  };
}

async function loadNoteRecord(
  learningTaskId: number,
): Promise<LearningTaskNoteRecord> {
  const [row] = await db
    .select({
      status: aiNoteTable.status,
      markdown: aiNoteTable.markdown,
      requestedAt: aiNoteTable.requestedAt,
      completedAt: aiNoteTable.completedAt,
      errorMessage: aiNoteTable.errorMessage,
    })
    .from(aiNoteTable)
    .where(eq(aiNoteTable.learningTaskId, learningTaskId))
    .limit(1);

  return mapRecord(row ?? null);
}

export async function prepareLearningTaskNoteGeneration(
  args: PrepareLearningTaskNoteGenerationArgs,
): Promise<PrepareLearningTaskNoteGenerationResult> {
  const { userId, learningPlanPublicId, learningTaskPublicId, force } = args;

  const [learningTaskRow] = await db
    .select({
      learningTaskDbId: learningTaskTable.id,
      learningTaskPublicId: learningTaskTable.publicId,
      learningTaskTitle: learningTaskTable.title,
      learningTaskDescription: learningTaskTable.description,
      learningTaskDueDate: learningTaskTable.dueDate,
      learningTaskMemo: learningTaskTable.memo,
      learningTaskOrder: learningTaskTable.order,
      noteId: aiNoteTable.id,
      noteStatus: aiNoteTable.status,
      noteMarkdown: aiNoteTable.markdown,
      noteRequestedAt: aiNoteTable.requestedAt,
      noteCompletedAt: aiNoteTable.completedAt,
      noteErrorMessage: aiNoteTable.errorMessage,
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

  const noteRowExists =
    learningTaskRow.noteId !== null && learningTaskRow.noteId !== undefined;
  const currentRecord = mapRecord(
    noteRowExists
      ? {
          status: learningTaskRow.noteStatus,
          markdown: learningTaskRow.noteMarkdown,
          requestedAt: learningTaskRow.noteRequestedAt,
          completedAt: learningTaskRow.noteCompletedAt,
          errorMessage: learningTaskRow.noteErrorMessage,
        }
      : null,
  );

  const isCurrentlyProcessing =
    currentRecord.status === LEARNING_TASK_NOTE_STATUS.processing;

  const shouldForce = force === true;
  const canStartGeneration =
    !isCurrentlyProcessing &&
    (shouldForce ||
      currentRecord.status === LEARNING_TASK_NOTE_STATUS.idle ||
      currentRecord.status === LEARNING_TASK_NOTE_STATUS.failed);

  if (!canStartGeneration) {
    return {
      started: false,
      record: currentRecord,
    };
  }

  const requestTimestamp = new Date();
  let persistedRecord: LearningTaskNoteRecord | null = null;

  if (noteRowExists) {
    const updateResult = await db
      .update(aiNoteTable)
      .set({
        status: LEARNING_TASK_NOTE_STATUS.processing,
        requestedAt: requestTimestamp,
        completedAt: null,
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(aiNoteTable.id, learningTaskRow.noteId!),
          eq(
            aiNoteTable.status,
            learningTaskRow.noteStatus ?? LEARNING_TASK_NOTE_STATUS.idle,
          ),
        ),
      )
      .returning({
        status: aiNoteTable.status,
        markdown: aiNoteTable.markdown,
        requestedAt: aiNoteTable.requestedAt,
        completedAt: aiNoteTable.completedAt,
        errorMessage: aiNoteTable.errorMessage,
      });

    if (!updateResult.length) {
      return {
        started: false,
        record: await loadNoteRecord(learningTaskRow.learningTaskDbId),
      };
    }

    persistedRecord = mapRecord(updateResult[0]);
  } else {
    const insertResult = await db
      .insert(aiNoteTable)
      .values({
        learningTaskId: learningTaskRow.learningTaskDbId,
        status: LEARNING_TASK_NOTE_STATUS.processing,
        requestedAt: requestTimestamp,
        completedAt: null,
        errorMessage: null,
        updatedAt: requestTimestamp,
      })
      .onConflictDoNothing({ target: aiNoteTable.learningTaskId })
      .returning({
        status: aiNoteTable.status,
        markdown: aiNoteTable.markdown,
        requestedAt: aiNoteTable.requestedAt,
        completedAt: aiNoteTable.completedAt,
        errorMessage: aiNoteTable.errorMessage,
      });

    if (!insertResult.length) {
      return {
        started: false,
        record: await loadNoteRecord(learningTaskRow.learningTaskDbId),
      };
    }

    persistedRecord = mapRecord(insertResult[0]);
  }

  await db
    .update(learningTaskTable)
    .set({
      updatedAt: new Date(),
    })
    .where(eq(learningTaskTable.id, learningTaskRow.learningTaskDbId));

  const learningPlanStructure = await db
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
    .where(
      eq(learningModuleTable.learningPlanId, learningTaskRow.learningPlanDbId),
    )
    .orderBy(asc(learningModuleTable.order), asc(learningTaskTable.order));

  const learningPlanLearningModulesMap = new Map<
    number,
    LearningTaskNotePromptInput["learningPlanLearningModules"][number]
  >();

  for (const row of learningPlanStructure) {
    if (!learningPlanLearningModulesMap.has(row.learningModuleDbId)) {
      learningPlanLearningModulesMap.set(row.learningModuleDbId, {
        title: row.learningModuleTitle,
        description: row.learningModuleDescription,
        order: row.learningModuleOrder,
        learningTasks: [],
      });
    }

    if (
      row.learningTaskTitle &&
      row.learningTaskOrder !== null &&
      row.learningTaskOrder !== undefined
    ) {
      learningPlanLearningModulesMap
        .get(row.learningModuleDbId)
        ?.learningTasks.push({
          title: row.learningTaskTitle,
          description: row.learningTaskDescription,
          order: row.learningTaskOrder,
          isCompleted: !!row.learningTaskIsCompleted,
        });
    }
  }

  const learningPlanLearningModules = Array.from(
    learningPlanLearningModulesMap.values(),
  ).sort((a, b) => a.order - b.order);

  const documents = await db
    .select({
      fileName: learningPlanDocumentTable.fileName,
      fileType: learningPlanDocumentTable.fileType,
      storageUrl: learningPlanDocumentTable.storageUrl,
    })
    .from(learningPlanDocumentTable)
    .where(
      eq(
        learningPlanDocumentTable.learningPlanId,
        learningTaskRow.learningPlanDbId,
      ),
    )
    .orderBy(desc(learningPlanDocumentTable.uploadedAt))
    .limit(2);

  const documentFiles: Array<NoteDocumentFile> = [];
  const referencedDocuments = documents.map((doc) => ({
    fileName: doc.fileName,
    originalFileType: doc.fileType,
  }));

  for (const document of documents) {
    try {
      const response = await fetch(document.storageUrl);
      if (!response.ok) {
        console.warn(
          "Failed to fetch learningPlan document for AI note:",
          response.statusText,
        );
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      documentFiles.push({
        fileName: document.fileName,
        mediaType: document.fileType,
        buffer: Buffer.from(arrayBuffer),
      });
    } catch (error) {
      console.error("Document fetch error during AI note generation:", error);
    }
  }

  const job: LearningTaskNoteGenerationJob = {
    learningTaskDbId: learningTaskRow.learningTaskDbId,
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
        dueDateLabel: formatDueDateLabel(
          learningTaskRow.learningTaskDueDate
            ? new Date(learningTaskRow.learningTaskDueDate)
            : null,
        ),
        memo: learningTaskRow.learningTaskMemo,
      },
      learningPlanLearningModules,
      weeklyHours: learningTaskRow.learningPlanWeeklyHours,
      totalWeeks: learningTaskRow.learningPlanTargetWeeks,
      referencedDocuments,
    },
    documentFiles,
  };

  const recordToReturn =
    persistedRecord ??
    ({
      status: LEARNING_TASK_NOTE_STATUS.processing,
      markdown: null,
      requestedAt: requestTimestamp,
      completedAt: null,
      errorMessage: null,
    } as LearningTaskNoteRecord);

  return {
    started: true,
    record: recordToReturn,
    job,
  };
}

export async function runLearningTaskNoteGeneration(
  job: LearningTaskNoteGenerationJob,
): Promise<void> {
  const prompt = generateLearningTaskNotePrompt(job.promptInput);
  const messages: Array<ModelMessage> = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt,
        },
      ],
    },
  ];

  for (const file of job.documentFiles) {
    messages.push({
      role: "user",
      content: [
        {
          type: "file",
          data: file.buffer,
          mediaType: file.mediaType || "application/pdf",
          filename: file.fileName,
        },
      ],
    });
  }

  try {
    const result = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      schema: LearningTaskNoteContentSchema,
      temperature: 0.6,
      messages,
    });

    const markdown = result.object?.markdown?.trim();

    if (!markdown) {
      throw AIErrors.noteGenerationFailed();
    }

    const completionTimestamp = new Date();

    const readyUpdateResult = await db
      .update(aiNoteTable)
      .set({
        status: LEARNING_TASK_NOTE_STATUS.ready,
        markdown,
        completedAt: completionTimestamp,
        errorMessage: null,
        updatedAt: completionTimestamp,
      })
      .where(eq(aiNoteTable.learningTaskId, job.learningTaskDbId))
      .returning();

    if (!readyUpdateResult.length) {
      await db
        .insert(aiNoteTable)
        .values({
          learningTaskId: job.learningTaskDbId,
          status: LEARNING_TASK_NOTE_STATUS.ready,
          markdown,
          requestedAt: completionTimestamp,
          completedAt: completionTimestamp,
          errorMessage: null,
          updatedAt: completionTimestamp,
        })
        .onConflictDoUpdate({
          target: aiNoteTable.learningTaskId,
          set: {
            status: LEARNING_TASK_NOTE_STATUS.ready,
            markdown,
            completedAt: completionTimestamp,
            errorMessage: null,
            updatedAt: completionTimestamp,
            requestedAt: completionTimestamp,
          },
        });
    }

    await db
      .update(learningTaskTable)
      .set({
        updatedAt: completionTimestamp,
      })
      .where(eq(learningTaskTable.id, job.learningTaskDbId));
  } catch (error) {
    console.error("Learning-task AI note generation failed:", error);

    const failureTimestamp = new Date();
    const errorMessage = sanitizeErrorMessage(error);

    const failedUpdateResult = await db
      .update(aiNoteTable)
      .set({
        status: LEARNING_TASK_NOTE_STATUS.failed,
        errorMessage,
        completedAt: failureTimestamp,
        updatedAt: failureTimestamp,
      })
      .where(eq(aiNoteTable.learningTaskId, job.learningTaskDbId))
      .returning();

    if (!failedUpdateResult.length) {
      await db
        .insert(aiNoteTable)
        .values({
          learningTaskId: job.learningTaskDbId,
          status: LEARNING_TASK_NOTE_STATUS.failed,
          requestedAt: failureTimestamp,
          completedAt: failureTimestamp,
          errorMessage,
          updatedAt: failureTimestamp,
        })
        .onConflictDoUpdate({
          target: aiNoteTable.learningTaskId,
          set: {
            status: LEARNING_TASK_NOTE_STATUS.failed,
            errorMessage,
            completedAt: failureTimestamp,
            updatedAt: failureTimestamp,
            requestedAt: failureTimestamp,
          },
        });
    }

    await db
      .update(learningTaskTable)
      .set({
        updatedAt: failureTimestamp,
      })
      .where(eq(learningTaskTable.id, job.learningTaskDbId));
  }
}
