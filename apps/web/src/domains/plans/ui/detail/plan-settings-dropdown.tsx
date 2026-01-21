import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { IconSettings } from "@tabler/icons-react";

import type { PlanActions } from "../../application";
import type { PlanStatus } from "../../model";

type PlanSettingsDropdownProps = {
  planId: string;
  planStatus: PlanStatus;
  actions: PlanActions;
};

/**
 * 플랜 설정 드롭다운
 *
 * - 일시정지/재개/보관 액션 제공
 * - 플랜 상태에 따라 표시되는 메뉴 변경
 */
export function PlanSettingsDropdown({
  planId,
  planStatus,
  actions,
}: PlanSettingsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>
        <IconSettings />
        설정
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {planStatus === "active" ? (
          <DropdownMenuItem
            disabled={actions.isSubmitting}
            onSelect={() => actions.executePlanAction(planId, "pause")}
          >
            일시정지하기
          </DropdownMenuItem>
        ) : planStatus === "paused" ? (
          <DropdownMenuItem
            disabled={actions.isSubmitting}
            onSelect={() => actions.executePlanAction(planId, "resume")}
          >
            다시 시작하기
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          disabled={actions.isSubmitting}
          onSelect={() => actions.executePlanAction(planId, "archive")}
        >
          보관하기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
