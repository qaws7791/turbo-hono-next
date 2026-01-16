import { learningPlanGenerator } from "./generator";

export const generatePlanWithAi = learningPlanGenerator.generate.bind(
  learningPlanGenerator,
);

export type {
  GeneratedModule,
  GeneratedSession,
  GeneratePlanInput,
  GeneratePlanResult,
  MaterialContext,
  PlanGoalType,
  PlanLevel,
} from "./types";
