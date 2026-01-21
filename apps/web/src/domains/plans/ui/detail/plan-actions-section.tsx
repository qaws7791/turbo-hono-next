import { Button } from "@repo/ui/button";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import { Link } from "react-router";

import { PlanSettingsDropdown } from "./plan-settings-dropdown";
import { SourceMaterialsDialog } from "./source-materials-dialog";

import type { PlanActions } from "../../application";
import type {
  PlanDetailQueueItem,
  PlanSourceMaterial,
  PlanStatus,
} from "../../model";

type PlanActionsSectionProps = {
  planId: string;
  planStatus: PlanStatus;
  nextSession: PlanDetailQueueItem | undefined;
  canStartSession: boolean;
  sourceMaterials: Array<PlanSourceMaterial>;
  actions: PlanActions;
};

/**
 * 플랜 액션 버튼 섹션
 *
 * - 세션 시작 버튼
 * - 참조 자료 다이얼로그
 * - 설정 드롭다운
 */
export function PlanActionsSection({
  planId,
  planStatus,
  nextSession,
  canStartSession,
  sourceMaterials,
  actions,
}: PlanActionsSectionProps) {
  return (
    <div className="flex gap-2 flex-row justify-between">
      {canStartSession && nextSession ? (
        <Button render={<Link to={nextSession.href} />}>
          <IconPlayerPlayFilled />
          세션 시작
        </Button>
      ) : (
        <Button disabled>세션 시작</Button>
      )}

      <div className="flex gap-2">
        <SourceMaterialsDialog materials={sourceMaterials} />
        <PlanSettingsDropdown
          planId={planId}
          planStatus={planStatus}
          actions={actions}
        />
      </div>
    </div>
  );
}
