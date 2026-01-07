import { Label } from "@repo/ui/label";
import { RadioGroup } from "@repo/ui/radio-group";
import { Separator } from "@repo/ui/separator";

import { GOAL_OPTIONS, LEVEL_OPTIONS } from "../../model";

import { RadioOptionCard } from "./radio-option-card";

import type { PlanGoal, PlanLevel, PlanWizardModel } from "../../model";

type StepGoalSettingProps = {
  model: PlanWizardModel;
};

/**
 * Step 2: 학습 목표 설정 단계
 * - 학습 목표 선택 (career, certificate, work, hobby)
 * - 현재 수준 선택 (novice, basic, intermediate, advanced)
 */
export function StepGoalSetting({ model }: StepGoalSettingProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="text-sm font-medium">학습 목표</div>
        <div className="text-muted-foreground text-sm">
          목적과 현재 수준을 고르면 AI가 흐름을 조정합니다.
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2">
        <GoalRadioGroup
          value={model.values.goal}
          onChange={model.setGoal}
        />
        <LevelRadioGroup
          value={model.values.level}
          onChange={model.setLevel}
        />
      </div>
    </div>
  );
}

function GoalRadioGroup({
  value,
  onChange,
}: {
  value: PlanGoal;
  onChange: (value: PlanGoal) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>학습 목표</Label>
      <RadioGroup
        value={value}
        onValueChange={(v: unknown) => {
          if (typeof v === "string") {
            onChange(v as PlanGoal);
          }
        }}
      >
        {GOAL_OPTIONS.map((opt) => (
          <RadioOptionCard
            key={opt.value}
            value={opt.value}
            label={opt.label}
          />
        ))}
      </RadioGroup>
    </div>
  );
}

function LevelRadioGroup({
  value,
  onChange,
}: {
  value: PlanLevel;
  onChange: (value: PlanLevel) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>현재 수준</Label>
      <RadioGroup
        value={value}
        onValueChange={(v: unknown) => {
          if (typeof v === "string") {
            onChange(v as PlanLevel);
          }
        }}
      >
        {LEVEL_OPTIONS.map((opt) => (
          <RadioOptionCard
            key={opt.value}
            value={opt.value}
            label={opt.label}
          />
        ))}
      </RadioGroup>
    </div>
  );
}
