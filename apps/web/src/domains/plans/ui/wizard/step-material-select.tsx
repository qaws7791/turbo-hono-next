import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Link } from "react-router";

import { canSelectMaterial } from "../../model";

import { MaterialSelectItem } from "./material-select-item";

import type { PlanWizardModel } from "../../model";

type StepMaterialSelectProps = {
  model: PlanWizardModel;
  materialsCount: number;
};

/**
 * Step 1: 자료 선택 단계
 * - 자료 검색
 * - 자료 목록 표시 및 선택
 * - Empty state 처리
 */
export function StepMaterialSelect({
  model,
  materialsCount,
}: StepMaterialSelectProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-medium">자료 선택</div>
          <div className="text-muted-foreground text-sm">
            최소 1개, 최대 5개. 분석 완료 자료만 포함할 수 있습니다.
          </div>
        </div>
        <Badge variant="outline">{model.derived.selectedCount}/5</Badge>
      </div>

      <Input
        value={model.values.search}
        onChange={(e) => model.setSearch(e.target.value)}
        placeholder="자료 제목/태그/요약 검색"
      />

      {materialsCount === 0 ? (
        <EmptyMaterialsState />
      ) : (
        <MaterialList model={model} />
      )}
    </div>
  );
}

function EmptyMaterialsState() {
  return (
    <div className="space-y-2">
      <div className="text-muted-foreground text-sm">
        학습 계획을 만들려면 학습 자료가 필요합니다.
      </div>
      <Button render={<Link to="/materials" />}>자료 업로드로 이동</Button>
    </div>
  );
}

function MaterialList({ model }: { model: PlanWizardModel }) {
  return (
    <div className="space-y-3">
      {model.derived.filteredMaterials.map((material) => {
        const checked = model.values.selectedMaterialIds.includes(material.id);
        const disabled =
          !canSelectMaterial(material) ||
          (!checked && model.derived.selectedCount >= 5);

        return (
          <MaterialSelectItem
            key={material.id}
            material={material}
            checked={checked}
            disabled={disabled}
            onToggle={() => model.toggleMaterial(material.id)}
          />
        );
      })}
    </div>
  );
}
