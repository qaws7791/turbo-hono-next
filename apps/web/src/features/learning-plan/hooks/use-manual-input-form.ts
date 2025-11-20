import React from "react";

interface UseManualInputFormReturn {
  learningTopic: string;
  setLearningTopic: (value: string) => void;
  mainGoal: string;
  setMainGoal: (value: string) => void;
  userLevel: string;
  setUserLevel: (value: string) => void;
  targetWeeks: number;
  setTargetWeeks: (value: number) => void;
  weeklyHours: number;
  setWeeklyHours: (value: number) => void;
  learningStyle: string;
  setLearningStyle: (value: string) => void;
  preferredResources: string;
  setPreferredResources: (value: string) => void;
  additionalRequirements: string;
  setAdditionalRequirements: (value: string) => void;
  isValid: boolean;
  getFormData: () => {
    learningTopic: string;
    mainGoal: string;
    userLevel: string;
    targetWeeks: number;
    weeklyHours: number;
    learningStyle: string;
    preferredResources: string;
    additionalRequirements?: string;
  };
}

/**
 * 수동 입력 폼 상태를 관리하는 훅
 */
export const useManualInputForm = (): UseManualInputFormReturn => {
  const [learningTopic, setLearningTopic] = React.useState<string>("");
  const [mainGoal, setMainGoal] = React.useState<string>("");
  const [userLevel, setUserLevel] = React.useState<string>("초보자");
  const [targetWeeks, setTargetWeeks] = React.useState<number>(4);
  const [weeklyHours, setWeeklyHours] = React.useState<number>(10);
  const [learningStyle, setLearningStyle] = React.useState<string>("실습 중심");
  const [preferredResources, setPreferredResources] =
    React.useState<string>("온라인 강의");
  const [additionalRequirements, setAdditionalRequirements] =
    React.useState<string>("");

  const isValid = learningTopic.trim().length > 0 && mainGoal.trim().length > 0;

  const getFormData = React.useCallback(
    () => ({
      learningTopic: learningTopic.trim(),
      mainGoal: mainGoal.trim(),
      userLevel,
      targetWeeks,
      weeklyHours,
      learningStyle,
      preferredResources,
      additionalRequirements: additionalRequirements.trim() || undefined,
    }),
    [
      learningTopic,
      mainGoal,
      userLevel,
      targetWeeks,
      weeklyHours,
      learningStyle,
      preferredResources,
      additionalRequirements,
    ],
  );

  return {
    learningTopic,
    setLearningTopic,
    mainGoal,
    setMainGoal,
    userLevel,
    setUserLevel,
    targetWeeks,
    setTargetWeeks,
    weeklyHours,
    setWeeklyHours,
    learningStyle,
    setLearningStyle,
    preferredResources,
    setPreferredResources,
    additionalRequirements,
    setAdditionalRequirements,
    isValid,
    getFormData,
  };
};
