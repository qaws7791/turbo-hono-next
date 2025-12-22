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
import { RadioGroup, RadioGroupItem } from "@repo/ui/radio-group";
import { Separator } from "@repo/ui/separator";
import { Textarea } from "@repo/ui/textarea";
import { Link } from "react-router";

import type { SessionController } from "./types";

function stepLabel(stepType: string): string {
  if (stepType === "LEARN") return "신규 개념 학습";
  if (stepType === "CHECK") return "이해도 체크";
  if (stepType === "PRACTICE") return "적용 활동";
  return "완료";
}

export function SessionView({
  controller,
  closeDialogOpen,
  onCloseDialogChange,
  onExit,
  onDone,
}: {
  controller: SessionController;
  closeDialogOpen: boolean;
  onCloseDialogChange: (open: boolean) => void;
  onExit: () => void;
  onDone: () => void;
}) {
  const { state, activeStep, progressPercent } = controller;

  return (
    <div className="bg-background text-foreground min-h-svh">
      <header className="border-b border-border bg-background/80 sticky top-0 z-10 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-3xl items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCloseDialogChange(true)}
          >
            닫기
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium">
                Step {state.currentStep + 1}/{state.totalSteps} ·{" "}
                {stepLabel(activeStep.type)}
              </div>
              {state.isRecovery ? (
                <Badge variant="outline">Recovery</Badge>
              ) : null}
            </div>
            <Progress
              value={progressPercent}
              className="mt-2"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link to="/home" />}
          >
            Home
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">
              {activeStep.type === "LEARN"
                ? activeStep.title
                : stepLabel(activeStep.type)}
            </CardTitle>
            <div className="text-muted-foreground text-sm">
              한 화면에 한 행동만. 다음으로 진행하세요.
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {activeStep.type === "LEARN" ? (
              <div className="space-y-3">
                <div className="text-muted-foreground whitespace-pre-wrap text-sm">
                  {activeStep.content}
                </div>
              </div>
            ) : null}

            {activeStep.type === "CHECK" ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Q.</div>
                  <div className="text-muted-foreground text-sm">
                    {activeStep.question}
                  </div>
                </div>
                <RadioGroup
                  value={
                    typeof controller.state.inputs.checkAnswer === "number"
                      ? String(controller.state.inputs.checkAnswer)
                      : ""
                  }
                  onValueChange={(value: unknown) => {
                    if (typeof value === "string") {
                      controller.setCheckAnswer(Number(value));
                    }
                  }}
                >
                  {activeStep.options.map((opt, idx) => (
                    <label
                      key={opt}
                      className="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-xl border p-3"
                    >
                      <RadioGroupItem value={String(idx)} />
                      <div className="text-sm">{opt}</div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            ) : null}

            {activeStep.type === "PRACTICE" ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-sm font-medium">직접 해보기</div>
                  <div className="text-muted-foreground text-sm">
                    {activeStep.prompt}
                  </div>
                </div>
                <Textarea
                  value={controller.state.inputs.practice ?? ""}
                  onChange={(e) => controller.setPractice(e.target.value)}
                  placeholder={activeStep.placeholder ?? "여기에 입력하세요"}
                />
              </div>
            ) : null}

            {activeStep.type === "COMPLETE" ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium">오늘 학습 완료</div>
                  <div className="text-muted-foreground text-sm">
                    {activeStep.summary}
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="text-sm font-medium">
                    저장된 Concept {controller.state.createdConceptIds.length}개
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Concept Library에서 바로 확인할 수 있습니다.
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="flex-1"
                    render={
                      <Link
                        to={`/concepts?sessionId=${controller.state.sessionId}`}
                      />
                    }
                  >
                    아카이브 보기
                  </Button>
                  <Button
                    className="flex-1"
                    variant="outline"
                    render={<Link to="/home" />}
                  >
                    홈으로
                  </Button>
                </div>
              </div>
            ) : null}

            <Separator />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="outline"
                onClick={controller.goPrev}
                disabled={
                  controller.state.currentStep === 0 ||
                  controller.state.status !== "ACTIVE"
                }
              >
                이전
              </Button>

              {activeStep.type === "COMPLETE" ? (
                <Button onClick={onDone}>완료</Button>
              ) : (
                <Button
                  onClick={controller.goNext}
                  disabled={!controller.canGoNext}
                >
                  {activeStep.type === "CHECK"
                    ? "확인"
                    : activeStep.type === "PRACTICE"
                      ? "정리하고 완료"
                      : "다음"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog
        open={closeDialogOpen}
        onOpenChange={onCloseDialogChange}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>학습을 중단할까요?</DialogTitle>
            <DialogDescription>
              진행 상황은 자동으로 저장됩니다. 언제든 이어서 학습할 수 있습니다.
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
              onClick={onExit}
            >
              나가기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
