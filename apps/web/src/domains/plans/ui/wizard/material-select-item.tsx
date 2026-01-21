import { Badge } from "@repo/ui/badge";
import { Checkbox } from "@repo/ui/checkbox";

import { materialStatusBadgeVariant } from "../../model";

import type { PlanWizardMaterial } from "../../model";

import {
  materialKindLabel,
  materialStatusLabel,
} from "~/domains/materials/model";

type MaterialSelectItemProps = {
  material: PlanWizardMaterial;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
};

/**
 * 자료 선택 아이템 카드 컴포넌트
 * Step 1에서 자료 목록을 표시할 때 사용
 */
export function MaterialSelectItem({
  material,
  checked,
  disabled,
  onToggle,
}: MaterialSelectItemProps) {
  return (
    <button
      type="button"
      className="border-border hover:bg-muted/50 flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors disabled:opacity-50"
      onClick={onToggle}
      disabled={disabled}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
      />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="truncate text-sm font-medium">{material.title}</div>
          <Badge variant={materialStatusBadgeVariant(material.status)}>
            {materialStatusLabel(material.status)}
          </Badge>
        </div>
        <div className="text-muted-foreground text-xs">
          {materialKindLabel(material.kind)}
        </div>
        {material.summary ? (
          <div className="text-muted-foreground text-sm">
            {material.summary}
          </div>
        ) : null}
      </div>
    </button>
  );
}
