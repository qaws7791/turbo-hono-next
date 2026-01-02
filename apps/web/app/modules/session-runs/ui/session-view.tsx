import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { Progress } from "@repo/ui/progress";
import { Separator } from "@repo/ui/separator";
import { Spinner } from "@repo/ui/spinner";
import { Link } from "react-router";

import { SessionStepContent } from "./session-step-content";

import type {
  CreateRunActivityBody,
  SessionRunDetailResponse,
} from "../domain";

type SessionRunDetail = SessionRunDetailResponse["data"];
type SessionStep = SessionRunDetail["blueprint"]["steps"][number];

function stepLabel(stepType: SessionStep["type"]): string {
  switch (stepType) {
    case "SESSION_INTRO":
      return "세션 소개";
    case "CONCEPT":
      return "개념 학습";
    case "CHECK":
      return "이해도 체크";
    case "CLOZE":
      return "빈칸 채우기";
    case "MATCHING":
      return "매칭";
    case "FLASHCARD":
      return "플래시카드";
    case "SPEED_OX":
      return "O/X 퀴즈";
    case "APPLICATION":
      return "적용 활동";
    case "SESSION_SUMMARY":
      return "세션 요약";
    default:
      return "학습";
  }
}

export type SessionViewProps = {
  detail: SessionRunDetail;
  stepIndex: number;
  inputs: Record<string, unknown>;
  isRecovery: boolean;
  isMutating: boolean;
  isSaving: boolean;
  closeDialogOpen: boolean;
  onCloseDialogChange: (open: boolean) => void;
  onUpdateInputs: (patch: Record<string, unknown>) => void;
  onRecordActivity: (body: CreateRunActivityBody) => void;
  onPrev: () => void;
  onNext: () => void;
  onComplete: () => void;
  onAbandon: () => void;
  redirectTo: string;
};

export function SessionView({
  detail,
  stepIndex,
  inputs,
  isRecovery,
  isMutating,
  isSaving,
  closeDialogOpen,
  onCloseDialogChange,
  onUpdateInputs,
  onRecordActivity,
  onPrev,
  onNext,
  onComplete,
  onAbandon,
  redirectTo,
}: SessionViewProps) {
  const steps = detail.blueprint.steps;
  const maxIndex = Math.max(0, steps.length - 1);
  const currentStep = steps[stepIndex];
  const progressPercent = Math.round(((stepIndex + 1) / steps.length) * 100);

  if (!currentStep) {
    return null;
  }

  const isLastStep = stepIndex >= maxIndex;

  return (
    <div className="bg-background text-foreground min-h-svh">
      {/* Header with progress */}
      <header className="border-b border-border bg-background/80 sticky top-0 z-10 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCloseDialogChange(true)}
            disabled={isMutating}
          >
            닫기
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium truncate">
                Step {stepIndex + 1}/{steps.length} ·{" "}
                {stepLabel(currentStep.type)}
              </div>
              <div className="flex items-center gap-2">
                {isRecovery ? <Badge variant="outline">Recovery</Badge> : null}
                {isSaving ? (
                  <span className="text-muted-foreground text-xs flex items-center gap-1">
                    <Spinner className="size-3" />
                    저장 중…
                  </span>
                ) : null}
              </div>
            </div>
            <Progress
              value={progressPercent}
              className="mt-2"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link to={redirectTo} />}
          >
            Home
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">
              {currentStep.type === "SESSION_INTRO"
                ? detail.session.title
                : currentStep.type === "CONCEPT"
                  ? (currentStep as Extract<SessionStep, { type: "CONCEPT" }>)
                      .title
                  : stepLabel(currentStep.type)}
            </CardTitle>
            <div className="text-muted-foreground text-sm">
              {detail.session.plan.title} ·{" "}
              {detail.session.module?.title ?? "Module"}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step content */}
            <SessionStepContent
              step={currentStep}
              inputs={inputs}
              onUpdateInputs={onUpdateInputs}
              onRecordActivity={onRecordActivity}
            />

            <Separator />

            {/* Navigation */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="outline"
                onClick={onPrev}
                disabled={stepIndex === 0 || isMutating}
              >
                이전
              </Button>

              {isLastStep ? (
                <Button
                  onClick={onComplete}
                  disabled={isMutating}
                >
                  {isMutating ? "완료 처리 중…" : "완료"}
                </Button>
              ) : (
                <Button
                  onClick={onNext}
                  disabled={isMutating}
                >
                  다음
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Close confirmation dialog */}
      <Dialog
        open={closeDialogOpen}
        onOpenChange={onCloseDialogChange}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>학습을 중단할까요?</DialogTitle>
            <DialogDescription>
              진행 상황은 자동으로 저장됩니다. 언제든지 이어서 학습할 수
              있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onCloseDialogChange(false)}
            >
              계속하기
            </Button>
            <Button
              className="flex-1"
              variant="destructive"
              onClick={onAbandon}
              disabled={isMutating}
            >
              {isMutating ? "처리 중…" : "나가기"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
