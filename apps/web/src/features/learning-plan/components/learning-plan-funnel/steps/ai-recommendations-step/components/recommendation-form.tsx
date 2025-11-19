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
  learningStyleOptions,
  resourceOptions,
  userLevelOptions,
} from "../constants";

interface RecommendationFormProps {
  userLevel: string;
  targetWeeks: number;
  weeklyHours: number;
  learningStyle: string;
  preferredResources: string;
  onUserLevelChange: (value: string) => void;
  onTargetWeeksChange: (value: number) => void;
  onWeeklyHoursChange: (value: number) => void;
  onLearningStyleChange: (value: string) => void;
  onPreferredResourcesChange: (value: string) => void;
}

export const RecommendationForm = ({
  userLevel,
  targetWeeks,
  weeklyHours,
  learningStyle,
  preferredResources,
  onUserLevelChange,
  onTargetWeeksChange,
  onWeeklyHoursChange,
  onLearningStyleChange,
  onPreferredResourcesChange,
}: RecommendationFormProps) => {
  return (
    <div className="space-y-6">
      {/* User Level */}
      <div>
        <Select
          value={userLevel}
          onChange={(key) => onUserLevelChange(key as string)}
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
            onChange={onTargetWeeksChange}
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
            onChange={onWeeklyHoursChange}
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
          onChange={(key) => onLearningStyleChange(key as string)}
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
          onChange={(key) => onPreferredResourcesChange(key as string)}
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
  );
};
