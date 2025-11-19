import { Button } from "@repo/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

import { ErrorState } from "./components/error-state";
import { LoadingState } from "./components/loading-state";
import { ReasoningDisplay } from "./components/reasoning-display";
import { RecommendationForm } from "./components/recommendation-form";
import { ResetButton } from "./components/reset-button";
import { usePlanRecommendationsQuery } from "./hooks/use-plan-recommendations-query";
import { useRecommendationSettings } from "./hooks/use-recommendation-settings";

import type { AiRecommendationsStepProps } from "./types";

export const AiRecommendationsStep = (props: AiRecommendationsStepProps) => {
  const { data, isLoading, error } = usePlanRecommendationsQuery({
    documentId: props.documentId,
    learningTopic: props.learningTopic,
    mainGoal: props.mainGoal,
  });

  const {
    settings,
    setUserLevel,
    setTargetWeeks,
    setWeeklyHours,
    setLearningStyle,
    setPreferredResources,
    hasChanges,
    handleReset,
    handleNext,
  } = useRecommendationSettings({
    initialSettings: data
      ? {
          userLevel: data.userLevel,
          targetWeeks: data.targetWeeks,
          weeklyHours: data.weeklyHours,
          learningStyle: data.learningStyle,
          preferredResources: data.preferredResources,
        }
      : null,
    onNext: props.onNext,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onBack={props.onBack}
      />
    );
  }

  return (
    <>
      <div className="p-8">
        <div className="space-y-6">
          <div className="text-center">
            <Sparkles className="mx-auto h-16 w-16 text-purple-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">AI 추천 학습 설정</h2>
            <p className="text-gray-600">
              문서를 분석한 결과를 바탕으로 최적의 설정을 추천해드립니다.
              <br />
              필요시 수정 후 계획을 생성하세요.
            </p>
          </div>

          <ReasoningDisplay reasoning={data?.reasoning || ""} />

          {hasChanges && <ResetButton onReset={handleReset} />}

          <RecommendationForm
            userLevel={settings.userLevel}
            targetWeeks={settings.targetWeeks}
            weeklyHours={settings.weeklyHours}
            learningStyle={settings.learningStyle}
            preferredResources={settings.preferredResources}
            onUserLevelChange={setUserLevel}
            onTargetWeeksChange={setTargetWeeks}
            onWeeklyHoursChange={setWeeklyHours}
            onLearningStyleChange={setLearningStyle}
            onPreferredResourcesChange={setPreferredResources}
          />
        </div>
      </div>

      <div className="px-6 py-4 flex justify-between">
        <Button
          onClick={props.onBack}
          variant="ghost"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          이전
        </Button>

        <Button onClick={handleNext}>
          학습 계획 생성
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </>
  );
};
