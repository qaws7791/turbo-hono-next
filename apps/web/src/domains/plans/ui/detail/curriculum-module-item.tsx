import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/accordion";
import { Badge } from "@repo/ui/badge";

import { calculateModuleProgress } from "../../model";

import { CurriculumSessionItem } from "./curriculum-session-item";

import type { PlanModule, PlanStatus } from "../../model";

type CurriculumModuleItemProps = {
  module: PlanModule;
  planId: string;
  planStatus: PlanStatus;
};

/**
 * 커리큘럼 모듈 아코디언 아이템
 *
 * - 모듈 제목, 요약, 진행률 표시
 * - 펼치면 세션 목록 표시
 */
export function CurriculumModuleItem({
  module,
  planId,
  planStatus,
}: CurriculumModuleItemProps) {
  const progressPercent = calculateModuleProgress(module.sessions);

  return (
    <AccordionItem value={module.id}>
      <AccordionTrigger>
        <div className="flex w-full items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-medium">{module.title}</div>
            {module.summary ? (
              <div className="text-muted-foreground truncate text-xs">
                {module.summary}
              </div>
            ) : null}
          </div>
          <Badge variant="outline">{progressPercent}%</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2">
          {module.sessions.map((session) => (
            <CurriculumSessionItem
              key={session.id}
              session={session}
              planId={planId}
              planStatus={planStatus}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
