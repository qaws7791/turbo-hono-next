import { Accordion } from "@repo/ui/accordion";

import { CurriculumModuleItem } from "./curriculum-module-item";

import type { PlanWithDerived } from "../../model";

type CurriculumSectionProps = {
  plan: PlanWithDerived;
};

/**
 * 학습 커리큘럼 섹션
 *
 * - 모듈 목록을 아코디언으로 표시
 */
export function CurriculumSection({ plan }: CurriculumSectionProps) {
  return (
    <div>
      <div className="pb-3">
        <h2 className="text-base font-medium">학습 커리큘럼</h2>
      </div>
      <div className="space-y-4">
        <Accordion
          multiple
          defaultValue={[]}
          className="w-full"
        >
          {plan.modules.map((module) => (
            <CurriculumModuleItem
              key={module.id}
              module={module}
              planId={plan.id}
              planStatus={plan.status}
            />
          ))}
        </Accordion>
      </div>
    </div>
  );
}
