import { Label } from "@repo/ui/form";
import { Progress } from "@repo/ui/progress-bar";
import { STEP_INFO, TOTAL_STEPS } from "./constants";
import type { StepKeys } from "@/domains/roadmap/types";

interface ProgressHeaderProps {
  currentStep: StepKeys;
}

export const ProgressHeader = ({ currentStep }: ProgressHeaderProps) => {
  const stepInfo = STEP_INFO[currentStep];
  const progressPercentage = ((stepInfo.order - 1) / TOTAL_STEPS) * 100;

  return (
    <div className="p-4 w-full">
      <Progress value={progressPercentage}>
        {({ valueText }) => (
          <div className="flex w-full justify-between">
            <Label>{stepInfo.label}</Label>
            <span className="value">{valueText}</span>
          </div>
        )}
      </Progress>
    </div>
  );
};