import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Progress } from "@repo/ui/progress";
import { Spinner } from "@repo/ui/spinner";
import { Link } from "react-router";

import type { PlanWithDerived } from "../../model/types";

type PlanGenerationViewProps = {
  plan: PlanWithDerived;
};

function clampPercent(value: number | null): number {
  if (value === null || !Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function getGenerationMessage(plan: PlanWithDerived): string {
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

export function PlanGenerationView({ plan }: PlanGenerationViewProps) {
  if (plan.generationStatus === "failed") {
    const message =
      plan.generationError ?? "알 수 없는 오류로 계획 생성에 실패했습니다.";

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">계획 생성에 실패했습니다</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              render={<Link to="/plans" />}
            >
              목록으로
            </Button>
            <Button render={<Link to="/plans/new" />}>새 계획 만들기</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressValue = clampPercent(plan.generationProgress) || 10;
  const message = getGenerationMessage(plan);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">학습 계획을 생성하고 있습니다</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          <span className="truncate">{message}</span>
        </div>

        <div className="space-y-2">
          <Progress value={progressValue} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{plan.generationStep ?? "GENERATING"}</span>
            <span>{progressValue}%</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">예상 소요시간: 약 1-2분</p>

        <Button
          variant="outline"
          render={<Link to="/plans" />}
          className="w-fit"
        >
          목록으로
        </Button>
      </CardContent>
    </Card>
  );
}
