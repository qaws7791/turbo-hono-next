import { Button } from "@repo/ui/button";

import type { PlanWizardStep } from "../../model";

type WizardFooterProps = {
  step: PlanWizardStep;
  isSubmitting: boolean;
  onCancel: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

/**
 * 위저드 푸터 컴포넌트
 * - 취소/이전/다음/제출 버튼
 * - 단계에 따른 버튼 상태 관리
 */
export function WizardFooter({
  step,
  isSubmitting,
  onCancel,
  onBack,
  onNext,
  onSubmit,
}: WizardFooterProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button
          variant="outline"
          onClick={onBack}
          disabled={step === 1 || isSubmitting}
        >
          이전
        </Button>
      </div>

      {step < 3 ? (
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
