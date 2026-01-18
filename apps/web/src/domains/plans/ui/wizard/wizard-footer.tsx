import { Button } from "@repo/ui/button";

import type { PlanWizardStep } from "../../model";

type WizardFooterProps = {
  step: PlanWizardStep;
  isSubmitting: boolean;
  onNext: () => void;
  onSubmit: () => void;
};

/**
 * 위저드 푸터 컴포넌트
 * - 다음/제출 버튼
 * - 단계에 따른 버튼 상태 관리
 */
export function WizardFooter({
  step,
  isSubmitting,
  onNext,
  onSubmit,
}: WizardFooterProps) {
  return (
    <div className="flex justify-end">
      {step === 1 ? (
        <Button
          onClick={onNext}
          disabled={isSubmitting}
        >
          다음
        </Button>
      ) : (
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "생성 중" : "학습 계획 생성하기"}
        </Button>
      )}
    </div>
  );
}
