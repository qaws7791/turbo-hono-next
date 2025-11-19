import React from "react";

import type { RecommendedSettings } from "../types";

interface UseRecommendationSettingsParams {
  initialSettings?: RecommendedSettings | null;
  onNext: (data: RecommendedSettings) => void;
}

export const useRecommendationSettings = ({
  initialSettings,
  onNext,
}: UseRecommendationSettingsParams) => {
  const [originalSettings, setOriginalSettings] =
    React.useState<RecommendedSettings | null>(null);

  const [userLevel, setUserLevel] = React.useState<string>("초보자");
  const [targetWeeks, setTargetWeeks] = React.useState<number>(4);
  const [weeklyHours, setWeeklyHours] = React.useState<number>(10);
  const [learningStyle, setLearningStyle] = React.useState<string>("실습 중심");
  const [preferredResources, setPreferredResources] =
    React.useState<string>("온라인 강의");

  React.useEffect(() => {
    if (initialSettings) {
      setOriginalSettings(initialSettings);
      setUserLevel(initialSettings.userLevel);
      setTargetWeeks(initialSettings.targetWeeks);
      setWeeklyHours(initialSettings.weeklyHours);
      setLearningStyle(initialSettings.learningStyle);
      setPreferredResources(initialSettings.preferredResources);
    }
  }, [initialSettings]);

  const hasChanges =
    originalSettings !== null &&
    (userLevel !== originalSettings.userLevel ||
      targetWeeks !== originalSettings.targetWeeks ||
      weeklyHours !== originalSettings.weeklyHours ||
      learningStyle !== originalSettings.learningStyle ||
      preferredResources !== originalSettings.preferredResources);

  const handleReset = () => {
    if (!originalSettings) return;

    setUserLevel(originalSettings.userLevel);
    setTargetWeeks(originalSettings.targetWeeks);
    setWeeklyHours(originalSettings.weeklyHours);
    setLearningStyle(originalSettings.learningStyle);
    setPreferredResources(originalSettings.preferredResources);
  };

  const handleNext = () => {
    onNext({
      userLevel,
      targetWeeks,
      weeklyHours,
      learningStyle,
      preferredResources,
    });
  };

  return {
    settings: {
      userLevel,
      targetWeeks,
      weeklyHours,
      learningStyle,
      preferredResources,
    },
    setUserLevel,
    setTargetWeeks,
    setWeeklyHours,
    setLearningStyle,
    setPreferredResources,
    hasChanges,
    handleReset,
    handleNext,
  };
};
