import { CardHeader, CardTitle } from "@repo/ui/card";

import type { PlanWizardStep } from "../../model";

type WizardHeaderProps = {
  step: PlanWizardStep;
  error: string | null;
};

/**
 * 위저드 헤더 컴포넌트
 * - 현재 단계 표시
 * - 에러 메시지 표시
 * - 닫기 버튼
 */
export function WizardHeader({ step, error }: WizardHeaderProps) {
  return (
    <CardHeader className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <CardTitle className="text-base">{step}단계/2</CardTitle>
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </CardHeader>
  );
}
