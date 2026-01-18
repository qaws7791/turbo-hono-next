import { PlanStatusBadge } from "../plan-status-badge";

import type { PlanWithDerived } from "../../model";

type PlanHeaderSectionProps = {
  plan: PlanWithDerived;
};

/**
 * 플랜 헤더 섹션
 *
 * - 플랜 제목 및 상태 뱃지
 * - 문서 수 메타 정보
 */
export function PlanHeaderSection({ plan }: PlanHeaderSectionProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <h2 className="text-foreground text-2xl font-semibold">{plan.title}</h2>
        <PlanStatusBadge status={plan.status} />
      </div>
      <div className="text-muted-foreground text-sm">
        문서 {plan.sourceMaterialIds.length}개
      </div>
    </div>
  );
}
