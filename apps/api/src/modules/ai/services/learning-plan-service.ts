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
 * Ensures data integrity by wrapping all operations in a single transaction.
 * If any operation fails, all changes are rolled back.
 *
 * @param data - Learning plan creation data.
 * @returns Saved learning plan with all related entities.
 */
export async function saveLearningPlanToDatabase(
  data: LearningPlanCreationData,
): Promise<SavedLearningPlan> {
  try {
    // Wrap all database operations in a transaction for atomicity
    return await db.transaction(async (tx) => {
      const now = new Date();

      // 1. Create learning plan record
      const learningPlanPublicId = generatePublicId(16);
      const learningPlanEmoji = LearningPlanEmoji.ensure(
        data.generatedLearningPlan.emoji,
        data.personalizedData.learningTopic || data.generatedLearningPlan.title,
      );

      const [savedLearningPlan] = await tx
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
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      if (!savedLearningPlan) {
        throw new Error("Failed to create learning plan");
      }

      // 2. Prepare bulk data for learning modules
      const modulesData = data.generatedLearningPlan.learningModules.map(
        (moduleData) => ({
          publicId: randomUUID(),
          learningPlanId: savedLearningPlan.id,
          title: moduleData.title,
          description: moduleData.description,
          order: moduleData.order,
          isExpanded: true,
          createdAt: now,
          updatedAt: now,
        }),
      );

      // 3. Bulk insert learning modules
      const savedModules = await tx
        .insert(learningModule)
        .values(modulesData)
        .returning();

      if (savedModules.length !== modulesData.length) {
        throw new Error("Failed to create all learning modules");
      }

      // 4. Prepare bulk data for learning tasks
      const tasksData = data.generatedLearningPlan.learningModules.flatMap(
        (moduleData, moduleIndex) => {
          const savedModule = savedModules[moduleIndex];
          if (!savedModule) {
            throw new Error(`Saved module at index ${moduleIndex} not found`);
          }
          return moduleData.learningTasks.map((taskData) => ({
            publicId: randomUUID(),
            learningModuleId: savedModule.id,
            title: taskData.title,
            description: taskData.description,
            order: taskData.order,
            isCompleted: false,
            dueDate: null,
            memo: null,
            createdAt: now,
            updatedAt: now,
          }));
        },
      );

      // 5. Bulk insert learning tasks
      const savedTasks = await tx
        .insert(learningTask)
        .values(tasksData)
        .returning();

      // 6. Build response structure with proper nesting
      let taskOffset = 0;
      const savedLearningModules: Array<SavedLearningModule> = savedModules.map(
        (module, moduleIndex) => {
          const generatedModule =
            data.generatedLearningPlan.learningModules[moduleIndex];
          if (!generatedModule) {
            throw new Error(
              `Generated module at index ${moduleIndex} not found`,
            );
          }

          const moduleTaskCount = generatedModule.learningTasks.length;
          const moduleTasks = savedTasks.slice(
            taskOffset,
            taskOffset + moduleTaskCount,
          );
          taskOffset += moduleTaskCount;

          return {
            publicId: module.publicId,
            title: module.title,
            description: module.description,
            order: module.order,
            isExpanded: module.isExpanded,
            learningTasks: moduleTasks.map((task) => ({
              publicId: task.publicId,
              title: task.title,
              description: task.description,
              order: task.order,
              isCompleted: task.isCompleted,
              dueDate: task.dueDate,
              memo: task.memo,
            })),
          };
        },
      );

      // 7. Return complete learning plan structure
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
    });
  } catch (error) {
    console.error("Database save error:", error);
    throw error;
  }
}
