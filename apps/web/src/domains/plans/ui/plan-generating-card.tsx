import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Progress } from "@repo/ui/progress";
import { Spinner } from "@repo/ui/spinner";
import * as React from "react";
import { Link } from "react-router";

import type { PlanWithDerived } from "../model/types";

import { getColorByName, getIconByName } from "~/foundation/lib/icon-color";

type PlanGeneratingCardProps = {
  plan: PlanWithDerived;
};

function generationBadgeVariant(
  status: PlanWithDerived["generationStatus"],
): React.ComponentProps<typeof Badge>["variant"] {
  if (status === "failed") return "destructive";
  if (status === "ready") return "secondary";
  return "outline";
}

function generationLabel(status: PlanWithDerived["generationStatus"]): string {
  if (status === "pending") return "생성 대기";
  if (status === "generating") return "생성 중";
  if (status === "failed") return "생성 실패";
  return "완료";
}

function clampPercent(value: number | null): number {
  if (value === null || !Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function getGenerationMessage(plan: PlanWithDerived): string {
  if (plan.generationStatus === "failed") {
    return plan.generationError ?? "계획 생성에 실패했습니다.";
  }

  if (plan.generationStep) {
    const stepMessages: Record<string, string> = {
      PREPARING: "계획 생성 준비 중입니다...",
      ANALYZING: "학습 자료 분석 중입니다...",
      CREATING_MODULES: "학습 모듈 생성 중입니다...",
      SCHEDULING: "학습 일정 배치 중입니다...",
      FINALIZING: "마무리 중입니다...",
    };
    return (
      stepMessages[plan.generationStep] ??
      "AI가 학습 계획을 생성하고 있습니다..."
    );
  }

  return "AI가 학습 계획을 생성하고 있습니다...";
}

export function PlanGeneratingCard({ plan }: PlanGeneratingCardProps) {
  const isGenerating =
    plan.generationStatus === "pending" ||
    plan.generationStatus === "generating";
  const progressValue = clampPercent(plan.generationProgress);
  const message = getGenerationMessage(plan);

  const PlanIcon = getIconByName(plan.icon);
  const colorData = getColorByName(plan.color);

  return (
    <Link to={`/plans/${plan.id}`}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colorData?.value + "20" }}
            >
              <PlanIcon
                className="w-6 h-6"
                style={{ color: colorData?.value }}
              />
            </div>
            <Badge variant={generationBadgeVariant(plan.generationStatus)}>
              {generationLabel(plan.generationStatus)}
            </Badge>
          </div>
          <CardTitle className="text-lg mt-2">{plan.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isGenerating ? <Spinner className="size-4" /> : null}
            <span className="truncate">{message}</span>
          </div>
          {plan.generationStatus === "failed" ? null : (
            <div className="space-y-2">
              <Progress value={progressValue} />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{plan.generationStep ?? "GENERATING"}</span>
                <span>{progressValue}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
