import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/radio-group";
import { Separator } from "@repo/ui/separator";
import { Textarea } from "@repo/ui/textarea";
import { Link } from "react-router";

import {
  documentKindLabel,
  documentStatusBadgeVariant,
  documentStatusLabel,
} from "~/modules/documents";

import type { MaterialListItem } from "~/modules/materials";
import type { CreatePlanBody } from "~/modules/plans";
import type { PlanWizardModel } from "../types";

function canSelectMaterial(material: MaterialListItem): boolean {
  return material.processingStatus === "READY";
}

const goalOptions: Array<{ value: CreatePlanBody["goalType"]; label: string }> =
  [
    { value: "JOB", label: "취업/이직" },
    { value: "CERT", label: "자격증 취득" },
    { value: "WORK", label: "업무 적용" },
    { value: "HOBBY", label: "취미/교양" },
    { value: "OTHER", label: "기타" },
  ];

const levelOptions: Array<{
  value: CreatePlanBody["currentLevel"];
  label: string;
}> = [
  { value: "BEGINNER", label: "초급" },
  { value: "INTERMEDIATE", label: "중급" },
  { value: "ADVANCED", label: "고급" },
];

export function PlanWizardView({
  spaceId,
  materials,
  model,
  isSubmitting,
  onCancel,
}: {
  spaceId: string;
  materials: Array<MaterialListItem>;
  model: PlanWizardModel;
  isSubmitting: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-foreground text-xl font-semibold">
          학습 계획 생성
        </h2>
        <p className="text-muted-foreground text-sm">
          3단계로 1분 내 학습 계획을 생성합니다.
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">{model.step}단계/3</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              render={<Link to={`/spaces/${spaceId}/plans`} />}
            >
              닫기
            </Button>
          </div>
          {model.error ? (
            <p className="text-destructive text-sm">{model.error}</p>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-6">
          {model.step === 1 ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">자료 선택</div>
                  <div className="text-muted-foreground text-sm">
                    최소 1개, 최대 5개. 분석 완료(READY) 자료만 포함할 수
                    있습니다.
                  </div>
                </div>
                <Badge variant="outline">{model.derived.selectedCount}/5</Badge>
              </div>

              <Input
                value={model.values.search}
                onChange={(e) => model.setSearch(e.target.value)}
                placeholder="제목/태그/요약 검색"
              />

              {materials.length === 0 ? (
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm">
                    학습 계획을 만들려면 학습 자료가 필요합니다.
                  </div>
                  <Button render={<Link to={`/spaces/${spaceId}/documents`} />}>
                    문서 업로드로 이동
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {model.derived.filteredMaterials.map((material) => {
                    const checked = model.values.selectedMaterialIds.includes(
                      material.id,
                    );
                    const disabled =
                      !canSelectMaterial(material) ||
                      (!checked && model.derived.selectedCount >= 5);

                    return (
                      <button
                        key={material.id}
                        type="button"
                        className="border-border hover:bg-muted/50 flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors disabled:opacity-50"
                        onClick={() => model.toggleMaterial(material.id)}
                        disabled={disabled}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium truncate">
                              {material.title}
                            </div>
                            <Badge
                              variant={documentStatusBadgeVariant(
                                material.processingStatus,
                              )}
                            >
                              {documentStatusLabel(material.processingStatus)}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {documentKindLabel(material.sourceType)} · 태그{" "}
                            {material.tags.length}개
                          </div>
                          {material.summary ? (
                            <div className="text-muted-foreground text-sm line-clamp-2">
                              {material.summary}
                            </div>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          {model.step === 2 ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">목표 및 현재 수준</div>
                <div className="text-muted-foreground text-sm">
                  목표와 현재 수준을 선택하세요.
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>목표</Label>
                <RadioGroup
                  value={model.values.goalType}
                  onValueChange={(value: unknown) => {
                    if (typeof value !== "string") return;
                    const next = goalOptions.find((o) => o.value === value);
                    if (!next) return;
                    model.setGoalType(next.value);
                  }}
                >
                  {goalOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-xl border p-3"
                    >
                      <RadioGroupItem value={opt.value} />
                      <div className="text-sm font-medium">{opt.label}</div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>현재 수준</Label>
                <RadioGroup
                  value={model.values.currentLevel}
                  onValueChange={(value: unknown) => {
                    if (typeof value !== "string") return;
                    const next = levelOptions.find((o) => o.value === value);
                    if (!next) return;
                    model.setCurrentLevel(next.value);
                  }}
                >
                  {levelOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-xl border p-3"
                    >
                      <RadioGroupItem value={opt.value} />
                      <div className="text-sm font-medium">{opt.label}</div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          ) : null}

          {model.step === 3 ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">기한 및 요구사항</div>
                <div className="text-muted-foreground text-sm">
                  목표 기한과 특별 요구사항을 입력하세요.
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="due-date">목표 기한</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={model.values.targetDueDate}
                  onChange={(e) => model.setTargetDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>특별 요구사항 (선택)</Label>
                <Textarea
                  value={model.values.specialRequirements}
                  onChange={(e) => model.setSpecialRequirements(e.target.value)}
                  placeholder="예: 주말에는 공부 못해요, 실습 위주로 짜주세요"
                />
              </div>
            </div>
          ) : null}

          <Separator />

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
                onClick={model.goBack}
                disabled={model.step === 1 || isSubmitting}
              >
                이전
              </Button>
            </div>

            {model.step < 3 ? (
              <Button
                onClick={model.goNext}
                disabled={isSubmitting}
              >
                다음
              </Button>
            ) : (
              <Button
                onClick={model.submit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "생성 중" : "학습 계획 생성하기"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
