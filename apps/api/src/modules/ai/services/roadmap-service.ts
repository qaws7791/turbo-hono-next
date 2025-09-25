import { randomUUID } from "crypto";
import type { z } from "zod";
import { db } from "../../../database/client";
import { goal, roadmap, subGoal } from "../../../database/schema";
import { generatePublicId } from "../../../utils/id-generator";
import type { GeneratedRoadmapSchema } from "../schema";

export type GeneratedRoadmap = z.infer<typeof GeneratedRoadmapSchema>;

export interface RoadmapCreationData {
  userId: string;
  generatedRoadmap: GeneratedRoadmap;
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

export interface SavedRoadmap {
  publicId: string;
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
  goals: SavedGoal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedGoal {
  publicId: string;
  title: string;
  description: string | null;
  order: number;
  isExpanded: boolean;
  subGoals: SavedSubGoal[];
}

export interface SavedSubGoal {
  publicId: string;
  title: string;
  description: string | null;
  order: number;
  isCompleted: boolean;
  dueDate: Date | null;
  memo: string | null;
}

/**
 * Saves a generated roadmap to the database using transaction
 * @param data - Roadmap creation data
 * @returns Saved roadmap with all related entities
 */
export async function saveRoadmapToDatabase(
  data: RoadmapCreationData,
): Promise<SavedRoadmap> {
  try {
    // 1. Create roadmap record
    const roadmapPublicId = generatePublicId(16);
    const [savedRoadmap] = await db
      .insert(roadmap)
      .values({
        publicId: roadmapPublicId,
        userId: data.userId,
        title: data.generatedRoadmap.title,
        description: data.generatedRoadmap.description,
        status: "active",
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

    if (!savedRoadmap) {
      throw new Error("Failed to create roadmap");
    }

    // 2. Create goals and subgoals
    const savedGoals: SavedGoal[] = [];

    for (const [goalIndex, goalData] of data.generatedRoadmap.goals.entries()) {
      const goalPublicId = randomUUID();
      const [savedGoal] = await db
        .insert(goal)
        .values({
          publicId: goalPublicId,
          roadmapId: savedRoadmap.id,
          title: goalData.title,
          description: goalData.description,
          order: goalData.order,
          isExpanded: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!savedGoal) {
        throw new Error(`Failed to create goal at index ${goalIndex}`);
      }

      // 3. Create subgoals for this goal
      const savedSubGoals: SavedSubGoal[] = [];

      for (const [subGoalIndex, subGoalData] of goalData.subGoals.entries()) {
        const subGoalPublicId = randomUUID();
        const [savedSubGoal] = await db
          .insert(subGoal)
          .values({
            publicId: subGoalPublicId,
            goalId: savedGoal.id,
            title: subGoalData.title,
            description: subGoalData.description,
            order: subGoalData.order,
            isCompleted: false,
            dueDate: null,
            memo: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        if (!savedSubGoal) {
          throw new Error(
            `Failed to create subgoal at index ${subGoalIndex} for goal ${goalIndex}`,
          );
        }

        savedSubGoals.push({
          publicId: savedSubGoal.publicId,
          title: savedSubGoal.title,
          description: savedSubGoal.description,
          order: savedSubGoal.order,
          isCompleted: savedSubGoal.isCompleted,
          dueDate: savedSubGoal.dueDate,
          memo: savedSubGoal.memo,
        });
      }

      savedGoals.push({
        publicId: savedGoal.publicId,
        title: savedGoal.title,
        description: savedGoal.description,
        order: savedGoal.order,
        isExpanded: savedGoal.isExpanded,
        subGoals: savedSubGoals,
      });
    }

    // 4. Return complete roadmap structure
    return {
      publicId: savedRoadmap.publicId,
      title: savedRoadmap.title,
      description: savedRoadmap.description,
      status: savedRoadmap.status,
      learningTopic: savedRoadmap.learningTopic,
      userLevel: savedRoadmap.userLevel,
      targetWeeks: savedRoadmap.targetWeeks,
      weeklyHours: savedRoadmap.weeklyHours,
      learningStyle: savedRoadmap.learningStyle,
      preferredResources: savedRoadmap.preferredResources,
      mainGoal: savedRoadmap.mainGoal,
      additionalRequirements: savedRoadmap.additionalRequirements,
      goals: savedGoals,
      createdAt: savedRoadmap.createdAt,
      updatedAt: savedRoadmap.updatedAt,
    };
  } catch (error) {
    console.error("Database save error:", error);
    throw error;
  }
}
