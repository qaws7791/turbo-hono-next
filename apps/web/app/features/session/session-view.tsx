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
import { Input } from "@repo/ui/input";
import { RadioGroup, RadioGroupItem } from "@repo/ui/radio-group";
import { Textarea } from "@repo/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  Info,
  Lightbulb,
  RotateCcw,
  X,
} from "lucide-react";
import * as React from "react";
import { Link } from "react-router";

import type { SessionController } from "./types";

function stepLabel(stepType: string): string {
  switch (stepType) {
    case "LEARN":
      return "신규 개념 학습";
    case "CHECK":
      return "이해도 점검";
    case "PRACTICE":
      return "적용 활동";
    case "INFO":
      return "정보";
    case "CODE":
      return "코드 실습";
    case "FLASHCARD":
      return "플래시카드";
    case "FILL_BLANK":
      return "빈칸 채우기";
    case "SUMMARY":
      return "요약";
    case "COMPLETE":
      return "완료";
    default:
      return "학습";
  }
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
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      {/* Header - 미니멀 헤더 */}
      <header className="bg-background/95 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-4">
          {/* X 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCloseDialogChange(true)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">나가기</span>
          </Button>

          {/* 그라데이션 프로그레스 바 */}
          <div className="flex-1 relative">
            <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 transition-all duration-500 ease-out relative"
                style={{ width: `${progressPercent}%` }}
              >
                {/* 글로우 효과 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {state.currentStep + 1} / {state.totalSteps}
          </span>

          {/* 복구 배지 (있을 경우만) */}
          {state.isRecovery ? (
            <Badge
              variant="outline"
              className="shrink-0"
            >
              복구
            </Badge>
          ) : null}
        </div>
      </header>

      {/* Main Content - 스크롤 영역 */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
          {/* Step Badge */}
          <Badge
            variant="secondary"
            className="my-4"
          >
            {stepLabel(activeStep.type)}
          </Badge>

          {activeStep.type === "LEARN" ? (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">{activeStep.title}</h1>
              <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {activeStep.content}
              </div>
            </div>
          ) : null}

          {activeStep.type === "CHECK" ? (
            <div className="space-y-6">
              {/* 질문 영역 */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{activeStep.question}</h1>
              </div>

              {/* 그리드 옵션 카드 */}
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
                className="grid grid-cols-2 gap-3"
              >
                {activeStep.options.map((opt, idx) => {
                  const isSelected =
                    controller.state.inputs.checkAnswer === idx;
                  return (
                    <label
                      key={opt}
                      className={`
                        relative flex flex-col items-center justify-center cursor-pointer 
                        rounded-2xl border-2 p-6 min-h-[140px]
                        transition-all duration-200 ease-out
                        hover:scale-[1.02] hover:shadow-lg
                        ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border bg-card hover:border-muted-foreground/50"
                        }
                      `}
                    >
                      {/* 옵션 텍스트 */}
                      <span className="text-center text-sm font-medium leading-relaxed">
                        {opt}
                      </span>

                      {/* 숨겨진 라디오 버튼 */}
                      <RadioGroupItem
                        value={String(idx)}
                        className="sr-only"
                      />

                      {/* 선택 체크 표시 */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </label>
                  );
                })}
              </RadioGroup>
            </div>
          ) : null}

          {activeStep.type === "PRACTICE" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-xl font-bold">직접 해보기</h1>
                <p className="text-muted-foreground">{activeStep.prompt}</p>
              </div>
              <Textarea
                value={controller.state.inputs.practice ?? ""}
                onChange={(e) => controller.setPractice(e.target.value)}
                placeholder={activeStep.placeholder ?? "여기에 입력하세요"}
                className="min-h-[200px] resize-none"
              />
            </div>
          ) : null}

          {/* INFO 스텝 - 읽기 전용 정보 */}
          {activeStep.type === "INFO" ? (
            <div className="space-y-4">
              <div
                className={`
                flex items-start gap-3 p-4 rounded-xl border
                ${activeStep.variant === "warning" ? "border-amber-500/30 bg-amber-500/10" : ""}
                ${activeStep.variant === "tip" ? "border-green-500/30 bg-green-500/10" : ""}
                ${activeStep.variant === "example" ? "border-purple-500/30 bg-purple-500/10" : ""}
                ${activeStep.variant === "info" || !activeStep.variant ? "border-blue-500/30 bg-blue-500/10" : ""}
              `}
              >
                <div className="shrink-0 mt-0.5">
                  {activeStep.variant === "warning" ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  ) : activeStep.variant === "tip" ? (
                    <Lightbulb className="w-5 h-5 text-green-500" />
                  ) : activeStep.variant === "example" ? (
                    <Code2 className="w-5 h-5 text-purple-500" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">{activeStep.title}</h2>
                  <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {activeStep.content}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* CODE 스텝 - 코드 실습 */}
          {activeStep.type === "CODE" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  코드 실습
                </h1>
                <p className="text-muted-foreground">
                  {activeStep.instruction}
                </p>
              </div>

              {activeStep.starterCode ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">시작 코드:</p>
                  <pre className="p-4 rounded-xl bg-muted/50 font-mono text-sm overflow-x-auto">
                    {activeStep.starterCode}
                  </pre>
                </div>
              ) : null}

              <Textarea
                value={controller.state.inputs.codeInput ?? ""}
                onChange={(e) => controller.setCodeInput(e.target.value)}
                placeholder="코드를 입력하세요..."
                className="min-h-[200px] resize-none font-mono text-sm"
              />

              {activeStep.hint ? (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    {activeStep.hint}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* FLASHCARD 스텝 - 플래시카드 */}
          {activeStep.type === "FLASHCARD" ? (
            <div className="space-y-6">
              <div
                className={`
                  relative min-h-[300px] rounded-2xl border-2 p-8
                  flex flex-col items-center justify-center text-center
                  cursor-pointer transition-all duration-300
                  ${
                    controller.state.inputs.flashcardRevealed
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-muted-foreground/50 hover:shadow-lg"
                  }
                `}
                onClick={() => {
                  if (!controller.state.inputs.flashcardRevealed) {
                    controller.setFlashcardRevealed(true);
                  }
                }}
              >
                {!controller.state.inputs.flashcardRevealed ? (
                  <>
                    <div className="text-xl font-semibold mb-4">
                      {activeStep.front}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      탭하여 정답 확인
                    </p>
                  </>
                ) : (
                  <>
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      질문:
                    </div>
                    <div className="text-lg mb-4">{activeStep.front}</div>
                    <div className="w-full h-px bg-border my-4" />
                    <div className="text-sm text-muted-foreground mb-2">
                      정답:
                    </div>
                    <div className="text-xl font-semibold text-primary">
                      {activeStep.back}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        controller.setFlashcardRevealed(false);
                      }}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      다시 보기
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : null}

          {/* FILL_BLANK 스텝 - 빈칸 채우기 */}
          {activeStep.type === "FILL_BLANK" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-xl font-bold">빈칸 채우기</h1>
                <p className="text-muted-foreground">
                  {activeStep.instruction}
                </p>
              </div>

              <div className="p-6 rounded-xl bg-muted/30 leading-relaxed">
                {activeStep.template
                  .split(/(\{\{[^}]+\}\})/)
                  .map((part, idx) => {
                    const match = part.match(/^\{\{([^}]+)\}\}$/);
                    if (match && match[1]) {
                      const blankId = match[1];
                      return (
                        <Input
                          key={idx}
                          value={
                            controller.state.inputs.filledBlanks?.[blankId] ??
                            ""
                          }
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            controller.setFilledBlank(blankId, e.target.value)
                          }
                          placeholder="..."
                          className="inline-block w-32 mx-1 text-center"
                        />
                      );
                    }
                    return <span key={idx}>{part}</span>;
                  })}
              </div>
            </div>
          ) : null}

          {/* SUMMARY 스텝 - 중간 요약 */}
          {activeStep.type === "SUMMARY" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-xl font-bold">{activeStep.title}</h1>
              </div>

              <div className="space-y-3">
                {activeStep.points.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-xl bg-muted/30"
                  >
                    <div className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
                      {idx + 1}
                    </div>
                    <p className="text-foreground">{point}</p>
                  </div>
                ))}
              </div>

              {activeStep.nextHint ? (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    {activeStep.nextHint}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          {activeStep.type === "COMPLETE" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-xl font-bold">🎉 오늘 학습 완료!</h1>
                <p className="text-muted-foreground">{activeStep.summary}</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    저장된 개념 {controller.state.createdConceptIds.length}개
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    개념 라이브러리에서 바로 확인할 수 있습니다.
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3 sm:flex-row">
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
                  onClick={onDone}
                >
                  완료
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* Bottom Fixed Buttons - 완료 화면 제외 */}
      {activeStep.type !== "COMPLETE" ? (
        <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0">
          <div className="mx-auto flex w-full max-w-3xl gap-3 px-4 py-4">
            <Button
              variant="outline"
              onClick={controller.goPrev}
              disabled={
                controller.state.currentStep === 0 ||
                controller.state.status !== "ACTIVE"
              }
              className="w-24 shrink-0 h-12 rounded-2xl"
            >
              이전
            </Button>
            <Button
              onClick={controller.goNext}
              disabled={!controller.canGoNext}
              className="flex-1 h-12 rounded-2xl"
            >
              {(() => {
                const nextStep = state.steps[state.currentStep + 1];
                const isBeforeComplete =
                  nextStep && nextStep.type === "COMPLETE";

                if (isBeforeComplete) return "학습 완료";
                if (activeStep.type === "CHECK") return "정답 확인";
                if (
                  activeStep.type === "FLASHCARD" &&
                  !state.inputs.flashcardRevealed
                )
                  return "정답 보기";
                return "다음";
              })()}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Exit Dialog */}
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
