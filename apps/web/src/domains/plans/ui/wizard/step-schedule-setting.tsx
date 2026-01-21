import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { RadioGroup } from "@repo/ui/radio-group";
import { Separator } from "@repo/ui/separator";
import { Textarea } from "@repo/ui/textarea";

import { RadioOptionCard } from "./radio-option-card";

import type { PlanWizardModel } from "../../model";

type StepScheduleSettingProps = {
  model: PlanWizardModel;
};

/**
 * Step 3: 기한 및 요구사항 설정 단계
 * - 목표 기한 설정 (adaptive / custom)
 * - 특별 요구사항 입력
 */
export function StepScheduleSetting({ model }: StepScheduleSettingProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="text-sm font-medium">기한 및 요구사항</div>
        <div className="text-muted-foreground text-sm">
          현실적인 스케줄과 요구사항을 남기면 세션 흐름에 반영됩니다.
        </div>
      </div>

      <Separator />

      <DurationSection model={model} />
      <NotesSection
        value={model.values.notes}
        onChange={model.setNotes}
      />
    </div>
  );
}

function DurationSection({ model }: { model: PlanWizardModel }) {
  return (
    <div className="space-y-3">
      <Label>목표 기한</Label>
      <RadioGroup
        value={model.values.durationMode}
        onValueChange={(v: unknown) => {
          if (v === "adaptive" || v === "custom") {
            model.setDurationMode(v);
          }
        }}
      >
        <RadioOptionCard
          value="adaptive"
          label="학습량에 맞춤"
          description="AI가 분량을 분석해 적정 기간을 제안합니다."
        />
        <RadioOptionCard
          value="custom"
          label="원하는 기간 입력"
          description="일/주/월 단위로 직접 지정합니다."
        />
      </RadioGroup>

      {model.values.durationMode === "custom" ? (
        <CustomDurationInput model={model} />
      ) : null}
    </div>
  );
}

function CustomDurationInput({ model }: { model: PlanWizardModel }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <Input
        value={model.values.durationValue}
        onChange={(e) => model.setDurationValue(e.target.value)}
        inputMode="numeric"
        placeholder="예: 2"
      />
      <select
        className="border-border bg-background rounded-xl border px-3 py-2 text-sm outline-none"
        value={model.values.durationUnit}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "days" || v === "weeks" || v === "months") {
            model.setDurationUnit(v);
          }
        }}
      >
        <option value="days">일</option>
        <option value="weeks">주</option>
        <option value="months">월</option>
      </select>
      <Button
        variant="outline"
        disabled
      >
        미리보기 없음
      </Button>
    </div>
  );
}

function NotesSection({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>특별 요구사항 (선택)</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="예: 주말에는 공부 못해요, 실습 위주로 짜주세요"
      />
    </div>
  );
}
