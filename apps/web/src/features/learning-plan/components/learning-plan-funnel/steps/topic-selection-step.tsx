import { Button } from "@repo/ui/button";
import { Label } from "@repo/ui/form";
import {
  Slider,
  SliderFillTrack,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from "@repo/ui/slider";
import { FormTextField } from "@repo/ui/text-field";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

import { getCurrentLevelLabel } from "../utils";

import type { FunnelSteps } from "@/features/learning-plan/model/types";

interface TopicSelectionStepProps {
  learningTopic: FunnelSteps["TopicSelection"]["learningTopic"];
  currentLevel: FunnelSteps["TopicSelection"]["currentLevel"];
  targetWeeks: FunnelSteps["TopicSelection"]["targetWeeks"];
  weeklyHours: FunnelSteps["TopicSelection"]["weeklyHours"];
  onNext: ({
    learningTopic,
    currentLevel,
    targetWeeks,
    weeklyHours,
  }: {
    learningTopic: string;
    currentLevel: number;
    targetWeeks: number;
    weeklyHours: number;
  }) => void;
}

export const TopicSelectionStep = (props: TopicSelectionStepProps) => {
  const [learningTopic, setLearningTopic] = React.useState<string>(
    props.learningTopic || "",
  );
  const [currentLevel, setCurrentLevel] = React.useState(
    props.currentLevel || 1,
  );
  const [targetWeeks, setTargetWeeks] = React.useState<number>(
    props.targetWeeks || 4,
  );
  const [weeklyHours, setWeeklyHours] = React.useState<number>(
    props.weeklyHours || 1,
  );
  const isValid = learningTopic && learningTopic.length > 0;
  return (
    <>
      <div className="p-8">
        <div className="space-y-6">
          <div className="text-center">
            <BookOpen className="mx-auto h-16 w-16 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">학습 주제와 수준</h2>
            <p className="text-gray-600">무엇을 배우고 싶으신가요?</p>
          </div>

          <div>
            <FormTextField
              label="학습 주제 선택"
              description="무엇을 배우고 싶으신가요?"
              value={learningTopic}
              onChange={setLearningTopic}
            />
          </div>

          <div>
            <Slider<number>
              defaultValue={1}
              minValue={1}
              maxValue={5}
              step={1}
              value={currentLevel}
              onChange={setCurrentLevel}
            >
              <div className="flex w-full justify-between">
                <Label>현재 수준</Label>
                <SliderOutput>
                  {({ state }) =>
                    `${getCurrentLevelLabel(state.getThumbValue(0))}`
                  }
                </SliderOutput>
              </div>
              <SliderTrack>
                <SliderFillTrack />
                <SliderThumb />
              </SliderTrack>
            </Slider>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>초보자</span>
              <span>전문가</span>
            </div>
          </div>

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
      </div>

      <div className=" px-6 py-4 flex justify-between">
        <Button isDisabled>
          <ChevronLeft className="w-4 h-4 mr-2" />
          이전
        </Button>

        <Button
          onClick={() =>
            props.onNext({
              learningTopic,
              currentLevel,
              targetWeeks,
              weeklyHours,
            })
          }
          isDisabled={!isValid}
        >
          다음
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </>
  );
};
