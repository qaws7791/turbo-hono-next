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

import type { Material, PlanGoal, PlanLevel } from "~/app/mocks/schemas";
import type { PlanWizardModel } from "~/domains/plans/model";

import {
  materialKindLabel,
  materialStatusLabel,
} from "~/domains/materials/model";

function materialStatusBadgeVariant(status: Material["status"]) {
  if (status === "completed") return "secondary" as const;
  if (status === "error") return "destructive" as const;
  return "outline" as const;
}

function canSelectMaterial(doc: Material): boolean {
  return doc.status === "completed";
}

const goalOptions: Array<{ value: PlanGoal; label: string }> = [
  { value: "career", label: "취업/이직" },
  { value: "certificate", label: "자격증 취득" },
  { value: "work", label: "업무 적용" },
  { value: "hobby", label: "취미/교양" },
];

const levelOptions: Array<{ value: PlanLevel; label: string }> = [
  { value: "novice", label: "완전 초보" },
  { value: "basic", label: "기초" },
  { value: "intermediate", label: "중급" },
  { value: "advanced", label: "고급" },
];

export function PlanWizardView({
  spaceId,
  materials,
  model,
  isSubmitting,
  onCancel,
}: {
  spaceId: string;
  materials: Array<Material>;
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

              {materials.length === 0 ? (
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm">
                    학습 계획을 만들려면 학습 자료가 필요합니다.
                  </div>
                  <Button render={<Link to={`/spaces/${spaceId}/materials`} />}>
                    자료 업로드로 이동
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {model.derived.filteredMaterials.map((doc) => {
                    const checked = model.values.selectedMaterialIds.includes(
                      doc.id,
                    );
                    const disabled =
                      !canSelectMaterial(doc) ||
                      (!checked && model.derived.selectedCount >= 5);

                    return (
                      <button
                        key={doc.id}
                        type="button"
                        className="border-border hover:bg-muted/50 flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors disabled:opacity-50"
                        onClick={() => model.toggleMaterial(doc.id)}
                        disabled={disabled}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="truncate text-sm font-medium">
                              {doc.title}
                            </div>
                            <Badge
                              variant={materialStatusBadgeVariant(doc.status)}
                            >
                              {materialStatusLabel(doc.status)}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {materialKindLabel(doc.kind)} · 태그{" "}
                            {doc.tags.length}개
                          </div>
                          {doc.summary ? (
                            <div className="text-muted-foreground text-sm">
                              {doc.summary}
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
                <div className="text-sm font-medium">학습 목표</div>
                <div className="text-muted-foreground text-sm">
                  목적과 현재 수준을 고르면 AI가 흐름을 조정합니다.
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>학습 목표</Label>
                  <RadioGroup
                    value={model.values.goal}
                    onValueChange={(value: unknown) => {
                      if (typeof value === "string") {
                        model.setGoal(value as PlanGoal);
                      }
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

                <div className="space-y-2">
                  <Label>현재 수준</Label>
                  <RadioGroup
                    value={model.values.level}
                    onValueChange={(value: unknown) => {
                      if (typeof value === "string") {
                        model.setLevel(value as PlanLevel);
                      }
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
            </div>
          ) : null}

          {model.step === 3 ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">기한 및 요구사항</div>
                <div className="text-muted-foreground text-sm">
                  현실적인 스케줄과 요구사항을 남기면 세션 흐름에 반영됩니다.
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>목표 기한</Label>
                <RadioGroup
                  value={model.values.durationMode}
                  onValueChange={(value: unknown) => {
                    if (value === "adaptive" || value === "custom") {
                      model.setDurationMode(value);
                    }
                  }}
                >
                  <label className="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-xl border p-3">
                    <RadioGroupItem value="adaptive" />
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">학습량에 맞춤</div>
                      <div className="text-muted-foreground text-xs">
                        AI가 분량을 분석해 적정 기간을 제안합니다.
                      </div>
                    </div>
                  </label>
                  <label className="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-xl border p-3">
                    <RadioGroupItem value="custom" />
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">
                        원하는 기간 입력
                      </div>
                      <div className="text-muted-foreground text-xs">
                        일/주/월 단위로 직접 지정합니다.
                      </div>
                    </div>
                  </label>
                </RadioGroup>

                {model.values.durationMode === "custom" ? (
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input
                      value={model.values.durationValue}
                      onChange={(e) => model.setDurationValue(e.target.value)}
                      inputMode="numeric"
                      placeholder="예: 2"
                    />
                    <select
                      className="border-border bg-background rounded-xl border px-3 py-2 text-sm outline-none"
                      value={model.values.durationUnit}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "days" || v === "weeks" || v === "months") {
                          model.setDurationUnit(v);
                        }
                      }}
                    >
                      <option value="days">일</option>
                      <option value="weeks">주</option>
                      <option value="months">월</option>
                    </select>
                    <Button
                      variant="outline"
                      disabled
                    >
                      미리보기 없음
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>특별 요구사항 (선택)</Label>
                <Textarea
                  value={model.values.notes}
                  onChange={(e) => model.setNotes(e.target.value)}
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
