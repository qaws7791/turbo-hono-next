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
import { FormTextField } from "@repo/ui/text-field";
import { ChevronLeft, ChevronRight, PenLine } from "lucide-react";

import { useManualInputForm } from "@/features/learning-plan/hooks/use-manual-input-form";

interface ManualInputStepProps {
  onBack: () => void;
  onNext: (data: {
    learningTopic: string;
    mainGoal: string;
    userLevel: string;
    targetWeeks: number;
    weeklyHours: number;
    learningStyle: string;
    preferredResources: string;
    additionalRequirements?: string;
  }) => void;
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

export const ManualInputStep = (props: ManualInputStepProps) => {
  const {
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
  } = useManualInputForm();

  const handleNext = () => {
    if (!isValid) {
      return;
    }
    props.onNext(getFormData());
  };

  return (
    <>
      <div className="p-8">
        <div className="space-y-6">
          <div className="text-center">
            <PenLine className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">학습 계획 상세 설정</h2>
            <p className="text-gray-600">
              학습 주제와 목표, 상세 설정을 입력해주세요
            </p>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <FormTextField
                label="학습 주제"
                description="무엇을 배우고 싶으신가요? (예: React 고급 패턴, TypeScript 타입 시스템)"
                value={learningTopic}
                onChange={setLearningTopic}
                isRequired
              />

              <FormTextField
                label="학습 목표"
                description="이 학습을 통해 달성하고 싶은 구체적인 목표를 입력해주세요 (예: 프로덕션 레벨의 React 애플리케이션 개발 능력 갖추기)"
                value={mainGoal}
                onChange={setMainGoal}
                isRequired
              />
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold mb-4">학습자 정보</h3>

              {/* User Level */}
              <div className="mb-4">
                <Select
                  className="w-[120px]"
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
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold mb-4">학습 선호도</h3>

              {/* Learning Style */}
              <div className="mb-4">
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
              <div className="mb-4">
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

              {/* Additional Requirements */}
              <FormTextField
                label="추가 요구사항 (선택)"
                description="특별히 고려해야 할 사항이나 요구사항이 있다면 입력해주세요 (예: 실무 프로젝트 중심으로 구성해주세요)"
                value={additionalRequirements}
                onChange={setAdditionalRequirements}
              />
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

        <Button
          onClick={handleNext}
          isDisabled={!isValid}
        >
          학습 계획 생성
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </>
  );
};
