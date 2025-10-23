import { google } from "@ai-sdk/google";
import {  generateObject } from "ai";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  aiNote as aiNoteTable,
  goal as goalTable,
  roadmapDocument as roadmapDocumentTable,
  roadmap as roadmapTable,
  subGoal as subGoalTable,
} from "@repo/database/schema";

import { db } from "../../../database/client";
import { AIError } from "../errors";
import {
  
  generateSubGoalNotePrompt
} from "../prompts/subgoal-note-prompts";
import { SubGoalNoteContentSchema } from "../schema";

import type {SubGoalNotePromptInput} from "../prompts/subgoal-note-prompts";
import type {ModelMessage} from "ai";

export const SUB_GOAL_NOTE_STATUS = {
  idle: "idle",
  processing: "processing",
  ready: "ready",
  failed: "failed",
} as const;

export type SubGoalNoteStatus =
  (typeof SUB_GOAL_NOTE_STATUS)[keyof typeof SUB_GOAL_NOTE_STATUS];

export interface SubGoalNoteRecord {
  status: SubGoalNoteStatus;
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

export interface SubGoalNoteGenerationJob {
  subGoalDbId: number;
  promptInput: SubGoalNotePromptInput;
  documentFiles: Array<NoteDocumentFile>;
}

interface PrepareSubGoalNoteGenerationArgs {
  userId: string;
  roadmapPublicId: string;
  subGoalPublicId: string;
  force?: boolean;
}

interface PrepareSubGoalNoteGenerationResult {
  started: boolean;
  record: SubGoalNoteRecord;
  job?: SubGoalNoteGenerationJob;
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
  if (error instanceof AIError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message.slice(0, 500);
  }

  return "알 수 없는 오류가 발생했습니다.";
}

function isSubGoalNoteStatus(value: unknown): value is SubGoalNoteStatus {
  return (
    typeof value === "string" &&
    (Object.values(SUB_GOAL_NOTE_STATUS) as Array<string>).includes(
      value as SubGoalNoteStatus,
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
): SubGoalNoteRecord {
  const status = isSubGoalNoteStatus(row?.status)
    ? row?.status
    : SUB_GOAL_NOTE_STATUS.idle;

  return {
    status,
    markdown: row?.markdown ?? null,
    requestedAt: row?.requestedAt ?? null,
    completedAt: row?.completedAt ?? null,
    errorMessage: row?.errorMessage ?? null,
  };
}

async function loadNoteRecord(subGoalId: number): Promise<SubGoalNoteRecord> {
  const [row] = await db
    .select({
      status: aiNoteTable.status,
      markdown: aiNoteTable.markdown,
      requestedAt: aiNoteTable.requestedAt,
      completedAt: aiNoteTable.completedAt,
      errorMessage: aiNoteTable.errorMessage,
    })
    .from(aiNoteTable)
    .where(eq(aiNoteTable.subGoalId, subGoalId))
    .limit(1);

  return mapRecord(row ?? null);
}

export async function prepareSubGoalNoteGeneration(
  args: PrepareSubGoalNoteGenerationArgs,
): Promise<PrepareSubGoalNoteGenerationResult> {
  const { userId, roadmapPublicId, subGoalPublicId, force } = args;

  const [subGoalRow] = await db
    .select({
      subGoalDbId: subGoalTable.id,
      subGoalPublicId: subGoalTable.publicId,
      subGoalTitle: subGoalTable.title,
      subGoalDescription: subGoalTable.description,
      subGoalDueDate: subGoalTable.dueDate,
      subGoalMemo: subGoalTable.memo,
      subGoalOrder: subGoalTable.order,
      noteId: aiNoteTable.id,
      noteStatus: aiNoteTable.status,
      noteMarkdown: aiNoteTable.markdown,
      noteRequestedAt: aiNoteTable.requestedAt,
      noteCompletedAt: aiNoteTable.completedAt,
      noteErrorMessage: aiNoteTable.errorMessage,
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

  const noteRowExists =
    subGoalRow.noteId !== null && subGoalRow.noteId !== undefined;
  const currentRecord = mapRecord(
    noteRowExists
      ? {
          status: subGoalRow.noteStatus,
          markdown: subGoalRow.noteMarkdown,
          requestedAt: subGoalRow.noteRequestedAt,
          completedAt: subGoalRow.noteCompletedAt,
          errorMessage: subGoalRow.noteErrorMessage,
        }
      : null,
  );

  const isCurrentlyProcessing =
    currentRecord.status === SUB_GOAL_NOTE_STATUS.processing;

  const shouldForce = force === true;
  const canStartGeneration =
    !isCurrentlyProcessing &&
    (shouldForce ||
      currentRecord.status === SUB_GOAL_NOTE_STATUS.idle ||
      currentRecord.status === SUB_GOAL_NOTE_STATUS.failed);

  if (!canStartGeneration) {
    return {
      started: false,
      record: currentRecord,
    };
  }

  const requestTimestamp = new Date();
  let persistedRecord: SubGoalNoteRecord | null = null;

  if (noteRowExists) {
    const updateResult = await db
      .update(aiNoteTable)
      .set({
        status: SUB_GOAL_NOTE_STATUS.processing,
        requestedAt: requestTimestamp,
        completedAt: null,
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(aiNoteTable.id, subGoalRow.noteId!),
          eq(
            aiNoteTable.status,
            subGoalRow.noteStatus ?? SUB_GOAL_NOTE_STATUS.idle,
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
        record: await loadNoteRecord(subGoalRow.subGoalDbId),
      };
    }

    persistedRecord = mapRecord(updateResult[0]);
  } else {
    const insertResult = await db
      .insert(aiNoteTable)
      .values({
        subGoalId: subGoalRow.subGoalDbId,
        status: SUB_GOAL_NOTE_STATUS.processing,
        requestedAt: requestTimestamp,
        completedAt: null,
        errorMessage: null,
        updatedAt: requestTimestamp,
      })
      .onConflictDoNothing({ target: aiNoteTable.subGoalId })
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
        record: await loadNoteRecord(subGoalRow.subGoalDbId),
      };
    }

    persistedRecord = mapRecord(insertResult[0]);
  }

  await db
    .update(subGoalTable)
    .set({
      updatedAt: new Date(),
    })
    .where(eq(subGoalTable.id, subGoalRow.subGoalDbId));

  const roadmapStructure = await db
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
    .where(eq(goalTable.roadmapId, subGoalRow.roadmapDbId))
    .orderBy(asc(goalTable.order), asc(subGoalTable.order));

  const roadmapGoalsMap = new Map<
    number,
    SubGoalNotePromptInput["roadmapGoals"][number]
  >();

  for (const row of roadmapStructure) {
    if (!roadmapGoalsMap.has(row.goalDbId)) {
      roadmapGoalsMap.set(row.goalDbId, {
        title: row.goalTitle,
        description: row.goalDescription,
        order: row.goalOrder,
        subGoals: [],
      });
    }

    if (
      row.subGoalTitle &&
      row.subGoalOrder !== null &&
      row.subGoalOrder !== undefined
    ) {
      roadmapGoalsMap.get(row.goalDbId)?.subGoals.push({
        title: row.subGoalTitle,
        description: row.subGoalDescription,
        order: row.subGoalOrder,
        isCompleted: !!row.subGoalIsCompleted,
      });
    }
  }

  const roadmapGoals = Array.from(roadmapGoalsMap.values()).sort(
    (a, b) => a.order - b.order,
  );

  const documents = await db
    .select({
      fileName: roadmapDocumentTable.fileName,
      fileType: roadmapDocumentTable.fileType,
      storageUrl: roadmapDocumentTable.storageUrl,
    })
    .from(roadmapDocumentTable)
    .where(eq(roadmapDocumentTable.roadmapId, subGoalRow.roadmapDbId))
    .orderBy(desc(roadmapDocumentTable.uploadedAt))
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
          "Failed to fetch roadmap document for AI note:",
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

  const job: SubGoalNoteGenerationJob = {
    subGoalDbId: subGoalRow.subGoalDbId,
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
        dueDateLabel: formatDueDateLabel(
          subGoalRow.subGoalDueDate
            ? new Date(subGoalRow.subGoalDueDate)
            : null,
        ),
        memo: subGoalRow.subGoalMemo,
      },
      roadmapGoals,
      weeklyHours: subGoalRow.roadmapWeeklyHours,
      totalWeeks: subGoalRow.roadmapTargetWeeks,
      referencedDocuments,
    },
    documentFiles,
  };

  const recordToReturn =
    persistedRecord ??
    ({
      status: SUB_GOAL_NOTE_STATUS.processing,
      markdown: null,
      requestedAt: requestTimestamp,
      completedAt: null,
      errorMessage: null,
    } as SubGoalNoteRecord);

  return {
    started: true,
    record: recordToReturn,
    job,
  };
}

export async function runSubGoalNoteGeneration(
  job: SubGoalNoteGenerationJob,
): Promise<void> {
  const prompt = generateSubGoalNotePrompt(job.promptInput);
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
      schema: SubGoalNoteContentSchema,
      temperature: 0.6,
      messages,
    });

    const markdown = result.object?.markdown?.trim();

    if (!markdown) {
      throw new AIError(
        500,
        "ai:note_generation_failed",
        "Failed to generate AI note",
      );
    }

    const completionTimestamp = new Date();

    const readyUpdateResult = await db
      .update(aiNoteTable)
      .set({
        status: SUB_GOAL_NOTE_STATUS.ready,
        markdown,
        completedAt: completionTimestamp,
        errorMessage: null,
        updatedAt: completionTimestamp,
      })
      .where(eq(aiNoteTable.subGoalId, job.subGoalDbId))
      .returning();

    if (!readyUpdateResult.length) {
      await db
        .insert(aiNoteTable)
        .values({
          subGoalId: job.subGoalDbId,
          status: SUB_GOAL_NOTE_STATUS.ready,
          markdown,
          requestedAt: completionTimestamp,
          completedAt: completionTimestamp,
          errorMessage: null,
          updatedAt: completionTimestamp,
        })
        .onConflictDoUpdate({
          target: aiNoteTable.subGoalId,
          set: {
            status: SUB_GOAL_NOTE_STATUS.ready,
            markdown,
            completedAt: completionTimestamp,
            errorMessage: null,
            updatedAt: completionTimestamp,
            requestedAt: completionTimestamp,
          },
        });
    }

    await db
      .update(subGoalTable)
      .set({
        updatedAt: completionTimestamp,
      })
      .where(eq(subGoalTable.id, job.subGoalDbId));
  } catch (error) {
    console.error("Sub-goal AI note generation failed:", error);

    const failureTimestamp = new Date();
    const errorMessage = sanitizeErrorMessage(error);

    const failedUpdateResult = await db
      .update(aiNoteTable)
      .set({
        status: SUB_GOAL_NOTE_STATUS.failed,
        errorMessage,
        completedAt: failureTimestamp,
        updatedAt: failureTimestamp,
      })
      .where(eq(aiNoteTable.subGoalId, job.subGoalDbId))
      .returning();

    if (!failedUpdateResult.length) {
      await db
        .insert(aiNoteTable)
        .values({
          subGoalId: job.subGoalDbId,
          status: SUB_GOAL_NOTE_STATUS.failed,
          requestedAt: failureTimestamp,
          completedAt: failureTimestamp,
          errorMessage,
          updatedAt: failureTimestamp,
        })
        .onConflictDoUpdate({
          target: aiNoteTable.subGoalId,
          set: {
            status: SUB_GOAL_NOTE_STATUS.failed,
            errorMessage,
            completedAt: failureTimestamp,
            updatedAt: failureTimestamp,
            requestedAt: failureTimestamp,
          },
        });
    }

    await db
      .update(subGoalTable)
      .set({
        updatedAt: failureTimestamp,
      })
      .where(eq(subGoalTable.id, job.subGoalDbId));
  }
}
