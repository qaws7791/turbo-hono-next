import { randomUUID } from "crypto";

import {
  learningModule,
  learningPlan,
  learningTask,
} from "@repo/database/schema";

import { db } from "../../../database/client";
import { generatePublicId } from "../../../utils/id-generator";
import { LearningPlanEmoji } from "../../learning-plan/utils/emoji";

import type { GeneratedLearningPlanSchema } from "../schema";
import type { z } from "zod";

export type GeneratedLearningPlan = z.infer<typeof GeneratedLearningPlanSchema>;

export interface LearningPlanCreationData {
  userId: string;
  generatedLearningPlan: GeneratedLearningPlan;
  personalizedData: {
    learningTopic: string;
    userLevel: string;
    targetWeeks: number;
    weeklyHours: number;
    learningStyle: string;
    preferredResources: string;
    mainGoal: string;
    additionalRequirements?: string;
  };
}

export interface SavedLearningPlan {
  id: number;
  publicId: string;
  emoji: string;
  title: string;
  description: string | null;
  status: string;
  learningTopic: string;
  userLevel: string;
  targetWeeks: number;
  weeklyHours: number;
  learningStyle: string;
  preferredResources: string;
  mainGoal: string;
  additionalRequirements: string | null;
  learningModules: Array<SavedLearningModule>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedLearningModule {
  publicId: string;
  title: string;
  description: string | null;
  order: number;
  isExpanded: boolean;
  learningTasks: Array<SavedLearningTask>;
}

export interface SavedLearningTask {
  publicId: string;
  title: string;
  description: string | null;
  order: number;
  isCompleted: boolean;
  dueDate: Date | null;
  memo: string | null;
}

/**
 * Saves a generated learning plan to the database using transaction.
 * @param data - Learning plan creation data.
 * @returns Saved learning plan with all related entities.
 */
export async function saveLearningPlanToDatabase(
  data: LearningPlanCreationData,
): Promise<SavedLearningPlan> {
  try {
    // 1. Create learning plan record
    const learningPlanPublicId = generatePublicId(16);
    const learningPlanEmoji = LearningPlanEmoji.ensure(
      data.generatedLearningPlan.emoji,
      data.personalizedData.learningTopic || data.generatedLearningPlan.title,
    );
    const [savedLearningPlan] = await db
      .insert(learningPlan)
      .values({
        publicId: learningPlanPublicId,
        userId: data.userId,
        title: data.generatedLearningPlan.title,
        description: data.generatedLearningPlan.description,
        status: "active",
        emoji: learningPlanEmoji,
        learningTopic: data.personalizedData.learningTopic,
        userLevel: data.personalizedData.userLevel,
        targetWeeks: data.personalizedData.targetWeeks,
        weeklyHours: data.personalizedData.weeklyHours,
        learningStyle: data.personalizedData.learningStyle,
        preferredResources: data.personalizedData.preferredResources,
        mainGoal: data.personalizedData.mainGoal,
        additionalRequirements: data.personalizedData.additionalRequirements,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!savedLearningPlan) {
      throw new Error("Failed to create learning plan");
    }

    // 2. Create learning modules and learning tasks
    const savedLearningModules: Array<SavedLearningModule> = [];

    for (const [
      learningModuleIndex,
      learningModuleData,
    ] of data.generatedLearningPlan.learningModules.entries()) {
      const learningModulePublicId = randomUUID();
      const [savedLearningModule] = await db
        .insert(learningModule)
        .values({
          publicId: learningModulePublicId,
          learningPlanId: savedLearningPlan.id,
          title: learningModuleData.title,
          description: learningModuleData.description,
          order: learningModuleData.order,
          isExpanded: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!savedLearningModule) {
        throw new Error(
          `Failed to create learning module at index ${learningModuleIndex}`,
        );
      }

      // 3. Create learning tasks for this learning module
      const savedLearningTasks: Array<SavedLearningTask> = [];

      for (const [
        learningTaskIndex,
        learningTaskData,
      ] of learningModuleData.learningTasks.entries()) {
        const learningTaskPublicId = randomUUID();
        const [savedLearningTask] = await db
          .insert(learningTask)
          .values({
            publicId: learningTaskPublicId,
            learningModuleId: savedLearningModule.id,
            title: learningTaskData.title,
            description: learningTaskData.description,
            order: learningTaskData.order,
            isCompleted: false,
            dueDate: null,
            memo: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        if (!savedLearningTask) {
          throw new Error(
            `Failed to create learningTask at index ${learningTaskIndex} for learning module ${learningModuleIndex}`,
          );
        }

        savedLearningTasks.push({
          publicId: savedLearningTask.publicId,
          title: savedLearningTask.title,
          description: savedLearningTask.description,
          order: savedLearningTask.order,
          isCompleted: savedLearningTask.isCompleted,
          dueDate: savedLearningTask.dueDate,
          memo: savedLearningTask.memo,
        });
      }

      savedLearningModules.push({
        publicId: savedLearningModule.publicId,
        title: savedLearningModule.title,
        description: savedLearningModule.description,
        order: savedLearningModule.order,
        isExpanded: savedLearningModule.isExpanded,
        learningTasks: savedLearningTasks,
      });
    }

    // 4. Return complete learning plan structure
    return {
      id: savedLearningPlan.id,
      publicId: savedLearningPlan.publicId,
      title: savedLearningPlan.title,
      description: savedLearningPlan.description,
      status: savedLearningPlan.status,
      learningTopic: savedLearningPlan.learningTopic,
      userLevel: savedLearningPlan.userLevel,
      targetWeeks: savedLearningPlan.targetWeeks,
      weeklyHours: savedLearningPlan.weeklyHours,
      learningStyle: savedLearningPlan.learningStyle,
      preferredResources: savedLearningPlan.preferredResources,
      mainGoal: savedLearningPlan.mainGoal,
      additionalRequirements: savedLearningPlan.additionalRequirements,
      learningModules: savedLearningModules,
      emoji: savedLearningPlan.emoji,
      createdAt: savedLearningPlan.createdAt,
      updatedAt: savedLearningPlan.updatedAt,
    };
  } catch (error) {
    console.error("Database save error:", error);
    throw error;
  }
}
