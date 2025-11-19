import { Button } from "@repo/ui/button";
import { Label } from "@repo/ui/form";
import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  Slider,
  SliderFillTrack,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from "@repo/ui/slider";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import React from "react";

import { getPlanRecommendations } from "@/features/learning-plan/api/learning-plan-service";
import { getErrorMessage, logger } from "@/shared/utils";

const aiRecommendationsLogger = logger.createScoped("AiRecommendationsStep");

interface AiRecommendationsStepProps {
  documentId: string;
  learningTopic: string;
  mainGoal: string;
  onBack: () => void;
  onNext: (data: {
    userLevel: string;
    targetWeeks: number;
    weeklyHours: number;
    learningStyle: string;
    preferredResources: string;
  }) => void;
}

interface RecommendedSettings {
  userLevel: string;
  targetWeeks: number;
  weeklyHours: number;
  learningStyle: string;
  preferredResources: string;
}

const userLevelOptions = ["초보자", "기초", "중급", "고급", "전문가"] as const;
const learningStyleOptions = [
  "시각적 학습",
  "실습 중심",
  "문서 읽기",
  "동영상 강의",
  "대화형 학습",
  "프로젝트 기반",
] as const;
const resourceOptions = [
  "온라인 강의",
  "책/전자책",
  "튜토리얼",
  "유튜브 영상",
  "공식 문서",
  "실습 사이트",
] as const;

export const AiRecommendationsStep = (props: AiRecommendationsStepProps) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reasoning, setReasoning] = React.useState<string>("");

  // Store original AI recommendations
  const [originalRecommendations, setOriginalRecommendations] =
    React.useState<RecommendedSettings | null>(null);

  // Current (possibly modified) values
  const [userLevel, setUserLevel] = React.useState<string>("초보자");
  const [targetWeeks, setTargetWeeks] = React.useState<number>(4);
  const [weeklyHours, setWeeklyHours] = React.useState<number>(10);
  const [learningStyle, setLearningStyle] = React.useState<string>("실습 중심");
  const [preferredResources, setPreferredResources] =
    React.useState<string>("온라인 강의");

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getPlanRecommendations({
          documentId: props.documentId,
          learningTopic: props.learningTopic,
          mainGoal: props.mainGoal,
        });

        if (response.error) {
          throw new Error("AI 추천을 가져오는데 실패했습니다");
        }

        if (!response.data) {
          throw new Error("추천 데이터가 없습니다");
        }

        const recommendations = response.data;
        const settings: RecommendedSettings = {
          userLevel: recommendations.userLevel,
          targetWeeks: recommendations.targetWeeks,
          weeklyHours: recommendations.weeklyHours,
          learningStyle: recommendations.learningStyle,
          preferredResources: recommendations.preferredResources,
        };

        // Store original recommendations
        setOriginalRecommendations(settings);

        // Set current values
        setUserLevel(settings.userLevel);
        setTargetWeeks(settings.targetWeeks);
        setWeeklyHours(settings.weeklyHours);
        setLearningStyle(settings.learningStyle);
        setPreferredResources(settings.preferredResources);
        setReasoning(recommendations.reasoning || "");
      } catch (err) {
        const errorMessage = getErrorMessage(
          err,
          "AI 추천을 가져오는데 실패했습니다",
        );
        setError(errorMessage);
        aiRecommendationsLogger.error(
          "Failed to fetch AI recommendations",
          err instanceof Error ? err : new Error(String(err)),
          { documentId: props.documentId, learningTopic: props.learningTopic },
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [props.documentId, props.learningTopic, props.mainGoal]);

  // Check if current settings differ from original recommendations
  const hasChanges =
    originalRecommendations !== null &&
    (userLevel !== originalRecommendations.userLevel ||
      targetWeeks !== originalRecommendations.targetWeeks ||
      weeklyHours !== originalRecommendations.weeklyHours ||
      learningStyle !== originalRecommendations.learningStyle ||
      preferredResources !== originalRecommendations.preferredResources);

  const handleResetToRecommendations = () => {
    if (!originalRecommendations) return;

    setUserLevel(originalRecommendations.userLevel);
    setTargetWeeks(originalRecommendations.targetWeeks);
    setWeeklyHours(originalRecommendations.weeklyHours);
    setLearningStyle(originalRecommendations.learningStyle);
    setPreferredResources(originalRecommendations.preferredResources);
  };

  const handleNext = () => {
    props.onNext({
      userLevel,
      targetWeeks,
      weeklyHours,
      learningStyle,
      preferredResources,
    });
  };

  if (isLoading) {
    return (
      <>
        <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <h2 className="text-xl font-semibold mb-2">AI가 분석 중입니다...</h2>
          <p className="text-gray-600 text-center">
            업로드하신 문서를 분석하여
            <br />
            최적의 학습 계획을 추천하고 있습니다
          </p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="p-8">
          <div className="text-center space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <p className="text-gray-600">
              AI 추천을 가져오는데 문제가 발생했습니다.
              <br />
              다시 시도해주세요.
            </p>
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
          <Button isDisabled>다음</Button>
        </div>
      </>
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

          {reasoning && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-medium text-purple-900 mb-1">
                💡 AI 추천 이유
              </p>
              <p className="text-sm text-purple-700">{reasoning}</p>
            </div>
          )}

          {hasChanges && (
            <div className="flex justify-center">
              <Button
                onClick={handleResetToRecommendations}
                variant="outline"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                AI 추천으로 되돌리기
              </Button>
            </div>
          )}

          <div className="space-y-6">
            {/* User Level */}
            <div>
              <Select
                value={userLevel}
                onChange={(key) => setUserLevel(key as string)}
              >
                <Label>현재 수준</Label>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectPopover>
                  <SelectListBox>
                    {userLevelOptions.map((level) => (
                      <SelectItem
                        key={level}
                        id={level}
                      >
                        {level}
                      </SelectItem>
                    ))}
                  </SelectListBox>
                </SelectPopover>
              </Select>
            </div>

            {/* Target Weeks and Weekly Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Slider<number>
                  defaultValue={4}
                  minValue={1}
                  maxValue={24}
                  step={1}
                  value={targetWeeks}
                  onChange={setTargetWeeks}
                >
                  <div className="flex w-full justify-between">
                    <Label>학습 기간</Label>
                    <SliderOutput>
                      {({ state }) => `${state.getThumbValue(0)}주`}
                    </SliderOutput>
                  </div>
                  <SliderTrack>
                    <SliderFillTrack />
                    <SliderThumb />
                  </SliderTrack>
                </Slider>
              </div>
              <div>
                <Slider<number>
                  defaultValue={10}
                  minValue={1}
                  maxValue={60}
                  step={1}
                  value={weeklyHours}
                  onChange={setWeeklyHours}
                >
                  <div className="flex w-full justify-between">
                    <Label>주당 학습 시간</Label>
                    <SliderOutput>
                      {({ state }) => `${state.getThumbValue(0)}시간`}
                    </SliderOutput>
                  </div>
                  <SliderTrack>
                    <SliderFillTrack />
                    <SliderThumb />
                  </SliderTrack>
                </Slider>
              </div>
            </div>

            {/* Learning Style */}
            <div>
              <Select
                value={learningStyle}
                onChange={(key) => setLearningStyle(key as string)}
              >
                <Label>선호하는 학습 방식</Label>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectPopover>
                  <SelectListBox>
                    {learningStyleOptions.map((style) => (
                      <SelectItem
                        key={style}
                        id={style}
                      >
                        {style}
                      </SelectItem>
                    ))}
                  </SelectListBox>
                </SelectPopover>
              </Select>
            </div>

            {/* Preferred Resources */}
            <div>
              <Select
                value={preferredResources}
                onChange={(key) => setPreferredResources(key as string)}
              >
                <Label>선호하는 학습 자료</Label>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectPopover>
                  <SelectListBox>
                    {resourceOptions.map((resource) => (
                      <SelectItem
                        key={resource}
                        id={resource}
                      >
                        {resource}
                      </SelectItem>
                    ))}
                  </SelectListBox>
                </SelectPopover>
              </Select>
            </div>
          </div>
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
