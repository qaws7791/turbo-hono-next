import { usePlanDetail } from "../application";

import {
  CurriculumSection,
  PlanActionsSection,
  PlanDetailBreadcrumb,
  PlanHeaderSection,
  PlanProgressSection,
} from "./detail";

import { PageBody } from "~/domains/app-shell";

type PlanDetailViewProps = {
  planId: string;
};

/**
 * 플랜 상세 페이지 View 컴포넌트
 *
 * - 플랜 정보, 진행률, 액션, 커리큘럼 섹션으로 구성
 * - usePlanDetail 훅으로 데이터와 로직 캡슐화
 */
export function PlanDetailView({ planId }: PlanDetailViewProps) {
  const detail = usePlanDetail(planId);

  return (
    <>
      <PlanDetailBreadcrumb planTitle={detail.plan.title} />
      <PageBody className="space-y-10 mt-24 max-w-4xl">
        <div className="flex flex-col gap-4 sm:justify-between">
          <PlanHeaderSection plan={detail.plan} />
          <PlanProgressSection plan={detail.plan} />
          <PlanActionsSection
            planId={detail.plan.id}
            planStatus={detail.plan.status}
            nextSession={detail.nextSession}
            canStartSession={detail.canStartSession}
            sourceMaterials={detail.sourceMaterials}
            actions={detail.actions}
          />
        </div>
        <CurriculumSection plan={detail.plan} />
      </PageBody>
    </>
  );
}
