import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/radio-group";
import { Separator } from "@repo/ui/separator";
import { Textarea } from "@repo/ui/textarea";
import * as React from "react";
import { Link } from "react-router";

import { buildCreatePlanBody } from "../../application";
import {
  MAX_PLAN_MATERIALS,
  addDaysToToday,
  isIsoDate,
  planGoalOptions,
  planLevelOptions,
} from "../../domain";

import type { MaterialListItem } from "~/modules/materials";
import type { CreatePlanBody } from "../../domain";

import {
  documentKindLabel,
  documentStatusBadgeVariant,
  documentStatusLabel,
} from "~/modules/documents";
import { isMaterialReadyForPlan } from "~/modules/materials";

type PlanWizardStep = 1 | 2 | 3;

export function PlanWizardView({
  spaceId,
  materials,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  spaceId: string;
  materials: Array<MaterialListItem>;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (body: CreatePlanBody) => void;
}) {
  const [step, setStep] = React.useState<PlanWizardStep>(1);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedMaterialIds, setSelectedMaterialIds] = React.useState<
    Array<string>
  >([]);
  const [search, setSearch] = React.useState("");
  const [goalType, setGoalType] =
    React.useState<CreatePlanBody["goalType"]>("WORK");
  const [currentLevel, setCurrentLevel] =
    React.useState<CreatePlanBody["currentLevel"]>("BEGINNER");
  const [targetDueDate, setTargetDueDate] = React.useState(addDaysToToday(30));
  const [specialRequirements, setSpecialRequirements] = React.useState("");

  const normalized = search.trim().toLowerCase();
  const filteredMaterials = React.useMemo(() => {
    return materials.filter((material) => {
      if (!normalized) return true;
      const hay =
        `${material.title} ${material.summary ?? ""} ${material.tags.join(" ")}`
          .toLowerCase()
          .trim();
      return hay.includes(normalized);
    });
  }, [materials, normalized]);

  const selectedCount = selectedMaterialIds.length;
  const hasInvalidSelection = selectedMaterialIds.some((id) => {
    const material = materials.find((m) => m.id === id);
    return !material || !isMaterialReadyForPlan(material);
  });

  const toggleMaterial = (materialId: string) => {
    if (selectedMaterialIds.includes(materialId)) {
      setSelectedMaterialIds(
        selectedMaterialIds.filter((id) => id !== materialId),
      );
    } else {
      if (selectedMaterialIds.length >= MAX_PLAN_MATERIALS) return;
      setSelectedMaterialIds([...selectedMaterialIds, materialId]);
    }
  };

  const goNext = () => {
    setError(null);

    if (step === 1) {
      if (selectedMaterialIds.length < 1) {
        setError("최소 1개 자료를 선택하세요.");
        return;
      }
      if (selectedMaterialIds.length > MAX_PLAN_MATERIALS) {
        setError("최대 5개까지 선택할 수 있습니다.");
        return;
      }
      if (hasInvalidSelection) {
        setError("분석 완료(READY) 자료만 선택할 수 있습니다.");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!isIsoDate(targetDueDate)) {
        setError("목표 기한(YYYY-MM-DD)을 확인하세요.");
        return;
      }
      setStep(3);
    }
  };

  const goBack = () => {
    setError(null);
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handleSubmit = () => {
    setError(null);

    if (selectedMaterialIds.length < 1) {
      setError("최소 1개 자료를 선택하세요.");
      setStep(1);
      return;
    }
    if (hasInvalidSelection) {
      setError("분석 완료(READY) 자료만 선택할 수 있습니다.");
      setStep(1);
      return;
    }
    if (!isIsoDate(targetDueDate)) {
      setError("목표 기한(YYYY-MM-DD)을 확인하세요.");
      setStep(2);
      return;
    }

    onSubmit(
      buildCreatePlanBody({
        materialIds: selectedMaterialIds,
        goalType,
        currentLevel,
        targetDueDate,
        specialRequirements,
      }),
    );
  };

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
            <CardTitle className="text-base">{step}단계/3</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              render={<Link to={`/spaces/${spaceId}/plans`} />}
            >
              닫기
            </Button>
          </div>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">자료 선택</div>
                  <div className="text-muted-foreground text-sm">
                    최소 1개, 최대 5개. 분석 완료(READY) 자료만 포함할 수
                    있습니다.
                  </div>
                </div>
                <Badge variant="outline">
                  {selectedCount}/{MAX_PLAN_MATERIALS}
                </Badge>
              </div>

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                  {filteredMaterials.map((material) => {
                    const checked = selectedMaterialIds.includes(material.id);
                    const disabled =
                      !isMaterialReadyForPlan(material) ||
                      (!checked && selectedCount >= MAX_PLAN_MATERIALS);

                    return (
                      <button
                        key={material.id}
                        type="button"
                        className="border-border hover:bg-muted/50 flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors disabled:opacity-50"
                        onClick={() => toggleMaterial(material.id)}
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

          {step === 2 ? (
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
                  value={goalType}
                  onValueChange={(value: unknown) => {
                    if (typeof value !== "string") return;
                    const next = planGoalOptions.find((o) => o.value === value);
                    if (!next) return;
                    setGoalType(next.value);
                  }}
                >
                  {planGoalOptions.map((opt) => (
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
                  value={currentLevel}
                  onValueChange={(value: unknown) => {
                    if (typeof value !== "string") return;
                    const next = planLevelOptions.find(
                      (o) => o.value === value,
                    );
                    if (!next) return;
                    setCurrentLevel(next.value);
                  }}
                >
                  {planLevelOptions.map((opt) => (
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

          {step === 3 ? (
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
                  value={targetDueDate}
                  onChange={(e) => setTargetDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>특별 요구사항 (선택)</Label>
                <Textarea
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
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
                onClick={goBack}
                disabled={step === 1 || isSubmitting}
              >
                이전
              </Button>
            </div>

            {step < 3 ? (
              <Button
                onClick={goNext}
                disabled={isSubmitting}
              >
                다음
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
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
