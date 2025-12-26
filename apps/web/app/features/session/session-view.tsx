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
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  RotateCcw,
  Sparkles,
  Target,
  X,
  XCircle,
} from "lucide-react";
import * as React from "react";
import Markdown from "react-markdown";
import { Link } from "react-router";
import remarkGfm from "remark-gfm";

import type { SessionStep } from "~/mock/schemas";
import type { SessionController } from "./types";

function stepLabel(stepType: string): string {
  switch (stepType) {
    case "SESSION_INTRO":
      return "오늘 배울 내용이에요 🎯";
    case "CONCEPT":
      return "함께 살펴봐요 📖";
    case "CHECK":
      return "확인해볼까요? ✏️";
    case "CLOZE":
      return "빈칸을 채워봐요 💡";
    case "MATCHING":
      return "짝을 맞춰봐요 🔗";
    case "FLASHCARD":
      return "기억을 떠올려봐요 🧠";
    case "SPEED_OX":
      return "맞을까요, 틀릴까요? ⚡";
    case "APPLICATION":
      return "실전에 적용해봐요 🛠️";
    case "SESSION_SUMMARY":
      return "오늘도 수고했어요! 🎊";
    default:
      return "함께 학습해요";
  }
}

function difficultyLabel(
  difficulty: "beginner" | "intermediate" | "advanced",
): string {
  switch (difficulty) {
    case "beginner":
      return "초급";
    case "intermediate":
      return "중급";
    case "advanced":
      return "고급";
  }
}

function difficultyColor(
  difficulty: "beginner" | "intermediate" | "advanced",
): string {
  switch (difficulty) {
    case "beginner":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "intermediate":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
    case "advanced":
      return "bg-red-500/10 text-red-600 border-red-500/30";
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
  const { state, activeStep, progressPercent, currentStepNumber, totalSteps } =
    controller;

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      {/* Header */}
      <header className="bg-background/95 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCloseDialogChange(true)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">나가기</span>
          </Button>

          <div className="flex-1 relative">
            <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 transition-all duration-500 ease-out relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {currentStepNumber} / {totalSteps}
          </span>

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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div
          key={activeStep.id}
          className="mx-auto w-full max-w-3xl px-4 py-8 animate-fade-in-up"
        >
          <Badge
            variant="secondary"
            className="my-4"
          >
            {stepLabel(activeStep.type)}
          </Badge>

          {/* === SESSION_INTRO === */}
          {activeStep.type === "SESSION_INTRO" ? (
            <div className="space-y-6">
              {/* 제목 영역 */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {activeStep.planTitle} &gt; {activeStep.moduleTitle}
                </p>
                <h1 className="text-2xl font-bold">
                  {activeStep.sessionTitle}
                </h1>
              </div>

              {/* 메타 정보 */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>약 {activeStep.durationMinutes}분</span>
                </div>
                <Badge
                  variant="outline"
                  className={difficultyColor(activeStep.difficulty)}
                >
                  {difficultyLabel(activeStep.difficulty)}
                </Badge>
              </div>

              {/* 학습 목표 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    오늘의 학습 목표
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activeStep.learningGoals.map((goal, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{goal}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 다룰 질문들 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />이 세션이
                    끝나면 답할 수 있는 질문들
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activeStep.questionsToCover.map((q, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-primary font-medium">Q.</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 선행 지식 */}
              {activeStep.prerequisites.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">
                    선행 지식:
                  </span>
                  {activeStep.prerequisites.map((p, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                    >
                      {p}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* === CONCEPT === */}
          {activeStep.type === "CONCEPT" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{activeStep.title}</h1>
                {activeStep.totalChapters && activeStep.totalChapters > 1 ? (
                  <Badge variant="outline">
                    {activeStep.chapterIndex} / {activeStep.totalChapters}
                  </Badge>
                ) : null}
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {activeStep.content}
                </Markdown>
              </div>
            </div>
          ) : null}

          {/* === CHECK (4지선다) === */}
          {activeStep.type === "CHECK" ? (
            <CheckStep
              step={activeStep}
              selectedIndex={state.inputs.answers?.[activeStep.id]}
              onSelect={controller.setAnswer}
            />
          ) : null}

          {/* === CLOZE (빈칸 맞히기) === */}
          {activeStep.type === "CLOZE" ? (
            <ClozeStep
              step={activeStep}
              selectedIndex={state.inputs.answers?.[activeStep.id]}
              onSelect={controller.setAnswer}
            />
          ) : null}

          {/* === FLASHCARD === */}
          {activeStep.type === "FLASHCARD" ? (
            <FlashcardStep
              step={activeStep}
              revealed={
                state.inputs.flashcardRevealed?.[activeStep.id] === true
              }
              result={state.inputs.flashcardResult?.[activeStep.id]}
              onReveal={() => controller.setFlashcardRevealed(true)}
              onResult={controller.setFlashcardResult}
              onReset={() => controller.setFlashcardRevealed(false)}
            />
          ) : null}

          {/* === SPEED_OX === */}
          {activeStep.type === "SPEED_OX" ? (
            <SpeedOxStep
              step={activeStep}
              answer={state.inputs.speedOxAnswers?.[activeStep.id]}
              onAnswer={controller.setSpeedOxAnswer}
            />
          ) : null}

          {/* === MATCHING === */}
          {activeStep.type === "MATCHING" ? (
            <MatchingStep
              step={activeStep}
              connections={
                state.inputs.matchingConnections?.[activeStep.id] ?? {}
              }
              onConnect={controller.setMatchingConnection}
              onClear={controller.clearMatching}
            />
          ) : null}

          {/* === APPLICATION === */}
          {activeStep.type === "APPLICATION" ? (
            <ApplicationStep
              step={activeStep}
              selectedIndex={state.inputs.answers?.[activeStep.id]}
              onSelect={controller.setAnswer}
            />
          ) : null}

          {/* === SESSION_SUMMARY === */}
          {activeStep.type === "SESSION_SUMMARY" ? (
            <div className="space-y-6">
              {/* 축하 메시지 */}
              <div className="text-center space-y-2">
                <div className="text-6xl">{activeStep.celebrationEmoji}</div>
                <h1 className="text-2xl font-bold">학습 완료!</h1>
                <p className="text-muted-foreground">
                  {activeStep.encouragement}
                </p>
              </div>

              {/* 요약 카드 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">학습 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 완료한 활동 */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">완료한 활동</div>
                    <div className="flex flex-wrap gap-2">
                      {activeStep.completedActivities.map((activity, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                        >
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 핵심 포인트 */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">핵심 포인트</div>
                    <ul className="space-y-1">
                      {activeStep.keyTakeaways.map((point, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 저장된 개념 */}
                  {state.createdConceptIds.length > 0 ? (
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>
                        저장된 개념: {state.createdConceptIds.length}개
                      </span>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* 다음 세션 미리보기 */}
              {activeStep.nextSessionPreview ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                      다음 세션
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {activeStep.nextSessionPreview.title}
                        </div>
                        {activeStep.nextSessionPreview.description ? (
                          <div className="text-sm text-muted-foreground">
                            {activeStep.nextSessionPreview.description}
                          </div>
                        ) : null}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* 액션 버튼 */}
              <div className="flex gap-3 sm:flex-row">
                <Button
                  className="flex-1 h-12"
                  render={
                    <Link to={`/concepts?sessionId=${state.sessionId}`} />
                  }
                >
                  아카이브 보기
                </Button>
                <Button
                  className="flex-1 h-12"
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

      {/* Bottom Fixed Buttons */}
      {activeStep.type !== "SESSION_SUMMARY" ? (
        <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0">
          <div className="mx-auto flex w-full max-w-3xl gap-3 px-4 py-4">
            <Button
              variant="outline"
              onClick={controller.goPrev}
              disabled={!controller.canGoPrev}
              className="w-24 shrink-0 h-12 rounded-2xl"
            >
              이전
            </Button>
            <Button
              onClick={controller.goNext}
              disabled={!controller.canGoNext}
              className="flex-1 h-12 rounded-2xl"
            >
              {activeStep.type === "SESSION_INTRO"
                ? "학습 시작"
                : controller.nextStep?.type === "SESSION_SUMMARY"
                  ? "학습 완료"
                  : "다음"}
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

// ============================================================
// CHECK Step Component
// ============================================================
function CheckStep({
  step,
  selectedIndex,
  onSelect,
}: {
  step: Extract<SessionStep, { type: "CHECK" }>;
  selectedIndex: number | undefined;
  onSelect: (index: number) => void;
}) {
  const hasSelected = selectedIndex !== undefined;
  const isCorrect = hasSelected && selectedIndex === step.answerIndex;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{step.question}</h1>

      <div className="grid grid-cols-2 gap-3">
        {step.options.map((opt, idx) => {
          const isSelected = selectedIndex === idx;
          const showCorrect = hasSelected && idx === step.answerIndex;
          const showWrong = hasSelected && isSelected && !isCorrect;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => !hasSelected && onSelect(idx)}
              disabled={hasSelected}
              className={`
                relative flex flex-col items-center justify-center
                rounded-2xl border-2 p-6 min-h-[120px]
                transition-all duration-200 ease-out
                ${hasSelected ? "cursor-default" : "cursor-pointer hover:scale-[1.02] hover:shadow-lg"}
                ${showCorrect ? "border-green-500 bg-green-500/10" : ""}
                ${showWrong ? "border-red-500 bg-red-500/10" : ""}
                ${!hasSelected && isSelected ? "border-primary bg-primary/5 shadow-md" : ""}
                ${!hasSelected && !isSelected ? "border-border bg-card hover:border-muted-foreground/50" : ""}
                ${hasSelected && !showCorrect && !showWrong ? "border-border bg-card opacity-50" : ""}
              `}
            >
              <span className="text-center text-sm font-medium leading-relaxed">
                {opt}
              </span>
              {showCorrect && (
                <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-green-500" />
              )}
              {showWrong && (
                <XCircle className="absolute top-3 right-3 w-5 h-5 text-red-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* 피드백 */}
      {hasSelected && step.explanation ? (
        <div
          className={`p-4 rounded-xl border ${isCorrect ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`}
        >
          <div className="flex items-start gap-2">
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            )}
            <div>
              <div className="font-medium mb-1">
                {isCorrect ? "정답입니다!" : "아쉬워요!"}
              </div>
              <div className="text-sm text-muted-foreground">
                {step.explanation}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================
// CLOZE Step Component
// ============================================================
function ClozeStep({
  step,
  selectedIndex,
  onSelect,
}: {
  step: Extract<SessionStep, { type: "CLOZE" }>;
  selectedIndex: number | undefined;
  onSelect: (index: number) => void;
}) {
  const hasSelected = selectedIndex !== undefined;
  const isCorrect = hasSelected && selectedIndex === step.answerIndex;

  // 문장에서 {{blank}} 부분을 하이라이트
  const parts = step.sentence.split(/(\{\{[^}]+\}\})/g);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        빈칸에 들어갈 알맞은 답을 선택하세요.
      </div>

      {/* 문장 */}
      <div className="p-6 rounded-xl bg-muted/30 text-lg leading-relaxed">
        {parts.map((part, idx) => {
          if (part.match(/^\{\{[^}]+\}\}$/)) {
            const answer = hasSelected ? step.options[selectedIndex] : "______";
            return (
              <span
                key={idx}
                className={`
                  px-2 py-1 rounded font-medium
                  ${hasSelected && isCorrect ? "bg-green-500/20 text-green-600" : ""}
                  ${hasSelected && !isCorrect ? "bg-red-500/20 text-red-600" : ""}
                  ${!hasSelected ? "bg-primary/20 text-primary" : ""}
                `}
              >
                {answer}
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>

      {/* 선택지 */}
      <div className="grid grid-cols-2 gap-3">
        {step.options.map((opt, idx) => {
          const isSelected = selectedIndex === idx;
          const showCorrect = hasSelected && idx === step.answerIndex;
          const showWrong = hasSelected && isSelected && !isCorrect;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => !hasSelected && onSelect(idx)}
              disabled={hasSelected}
              className={`
                relative flex items-center justify-center
                rounded-xl border-2 p-4 
                transition-all duration-200 ease-out
                ${hasSelected ? "cursor-default" : "cursor-pointer hover:scale-[1.02] hover:shadow-md"}
                ${showCorrect ? "border-green-500 bg-green-500/10" : ""}
                ${showWrong ? "border-red-500 bg-red-500/10" : ""}
                ${!hasSelected && isSelected ? "border-primary bg-primary/5" : ""}
                ${!hasSelected && !isSelected ? "border-border bg-card" : ""}
                ${hasSelected && !showCorrect && !showWrong ? "border-border bg-card opacity-50" : ""}
              `}
            >
              <span className="text-sm font-medium">{opt}</span>
              {showCorrect && (
                <CheckCircle2 className="absolute right-3 w-4 h-4 text-green-500" />
              )}
              {showWrong && (
                <XCircle className="absolute right-3 w-4 h-4 text-red-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* 피드백 */}
      {hasSelected && step.explanation ? (
        <div
          className={`p-4 rounded-xl border ${isCorrect ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`}
        >
          <div className="text-sm text-muted-foreground">
            {step.explanation}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================
// FLASHCARD Step Component
// ============================================================
function FlashcardStep({
  step,
  revealed,
  result,
  onReveal,
  onResult,
  onReset,
}: {
  step: Extract<SessionStep, { type: "FLASHCARD" }>;
  revealed: boolean;
  result: "know" | "dontknow" | undefined;
  onReveal: () => void;
  onResult: (value: "know" | "dontknow") => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div
        className={`
          relative min-h-[300px] rounded-2xl border-2 p-8
          flex flex-col items-center justify-center text-center
          transition-all duration-300
          ${revealed ? "border-primary bg-primary/5" : "border-border bg-card cursor-pointer hover:border-muted-foreground/50 hover:shadow-lg"}
        `}
        onClick={() => !revealed && onReveal()}
      >
        {!revealed ? (
          <>
            <div className="text-xl font-semibold mb-4">{step.front}</div>
            <p className="text-muted-foreground text-sm">탭하여 정답 확인</p>
          </>
        ) : (
          <>
            <div className="absolute top-3 right-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm text-muted-foreground mb-2">질문:</div>
            <div className="text-lg mb-4">{step.front}</div>
            <div className="w-full h-px bg-border my-4" />
            <div className="text-sm text-muted-foreground mb-2">정답:</div>
            <div className="text-xl font-semibold text-primary whitespace-pre-wrap">
              {step.back}
            </div>
          </>
        )}
      </div>

      {/* 알아요 / 몰라요 버튼 */}
      {revealed && !result ? (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-2xl border-red-500/30 text-red-600 hover:bg-red-500/10"
            onClick={() => onResult("dontknow")}
          >
            😅 몰라요
          </Button>
          <Button
            className="flex-1 h-12 rounded-2xl bg-green-500 hover:bg-green-600"
            onClick={() => onResult("know")}
          >
            😎 알아요
          </Button>
        </div>
      ) : null}

      {/* 결과 표시 */}
      {result ? (
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
          <span className="text-sm">
            {result === "know" ? "✅ 잘 알고 있어요!" : "📚 복습이 필요해요"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            다시 보기
          </Button>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================
// SPEED_OX Step Component
// ============================================================
function SpeedOxStep({
  step,
  answer,
  onAnswer,
}: {
  step: Extract<SessionStep, { type: "SPEED_OX" }>;
  answer: boolean | undefined;
  onAnswer: (value: boolean) => void;
}) {
  const hasAnswered = answer !== undefined;
  const isCorrect = hasAnswered && answer === step.isTrue;

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        다음 문장이 맞으면 O, 틀리면 X를 선택하세요.
      </div>

      {/* 문장 */}
      <div className="p-6 rounded-xl bg-muted/30 text-lg text-center">
        {step.statement}
      </div>

      {/* O / X 버튼 */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => !hasAnswered && onAnswer(true)}
          disabled={hasAnswered}
          className={`
            flex-1 h-24 rounded-2xl border-2 text-4xl font-bold
            transition-all duration-200
            ${hasAnswered ? "cursor-default" : "cursor-pointer hover:scale-[1.02]"}
            ${hasAnswered && step.isTrue ? "border-green-500 bg-green-500/20 text-green-600" : ""}
            ${hasAnswered && answer === true && !step.isTrue ? "border-red-500 bg-red-500/20 text-red-600" : ""}
            ${!hasAnswered ? "border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" : ""}
            ${hasAnswered && answer !== true && step.isTrue ? "border-green-500/50 bg-green-500/10 text-green-600/50" : ""}
            ${hasAnswered && answer !== true && !step.isTrue ? "opacity-30" : ""}
          `}
        >
          O
        </button>
        <button
          type="button"
          onClick={() => !hasAnswered && onAnswer(false)}
          disabled={hasAnswered}
          className={`
            flex-1 h-24 rounded-2xl border-2 text-4xl font-bold
            transition-all duration-200
            ${hasAnswered ? "cursor-default" : "cursor-pointer hover:scale-[1.02]"}
            ${hasAnswered && !step.isTrue ? "border-green-500 bg-green-500/20 text-green-600" : ""}
            ${hasAnswered && answer === false && step.isTrue ? "border-red-500 bg-red-500/20 text-red-600" : ""}
            ${!hasAnswered ? "border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20" : ""}
            ${hasAnswered && answer !== false && !step.isTrue ? "border-green-500/50 bg-green-500/10 text-green-600/50" : ""}
            ${hasAnswered && answer !== false && step.isTrue ? "opacity-30" : ""}
          `}
        >
          X
        </button>
      </div>

      {/* 피드백 */}
      {hasAnswered && step.explanation ? (
        <div
          className={`p-4 rounded-xl border ${isCorrect ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`}
        >
          <div className="flex items-start gap-2">
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            )}
            <div>
              <div className="font-medium mb-1">
                {isCorrect ? "정답!" : "오답!"}
              </div>
              <div className="text-sm text-muted-foreground">
                {step.explanation}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================
// MATCHING Step Component
// ============================================================
function MatchingStep({
  step,
  connections,
  onConnect,
  onClear,
}: {
  step: Extract<SessionStep, { type: "MATCHING" }>;
  connections: Record<string, string>;
  onConnect: (leftId: string, rightId: string) => void;
  onClear: () => void;
}) {
  const [selectedLeft, setSelectedLeft] = React.useState<string | null>(null);

  // 오른쪽 아이템들 셔플 (한 번만)
  const shuffledRight = React.useMemo(() => {
    const items = step.pairs.map((p) => ({ id: p.id, text: p.right }));
    return items.sort(() => Math.random() - 0.5);
  }, [step.pairs]);

  const connectedRights = new Set(Object.values(connections));
  const allConnected = Object.keys(connections).length === step.pairs.length;

  const handleLeftClick = (id: string) => {
    if (allConnected) return;
    if (connections[id]) {
      // 이미 연결된 경우, 연결 해제
      const newConnections = { ...connections };
      delete newConnections[id];
      // 전체 초기화 대신 해당 연결만 해제하려면 별도 액션 필요
      // 지금은 전체 초기화
      onClear();
      return;
    }
    setSelectedLeft(id);
  };

  const handleRightClick = (rightId: string) => {
    if (allConnected) return;
    if (!selectedLeft) return;
    if (connectedRights.has(rightId)) return;

    onConnect(selectedLeft, rightId);
    setSelectedLeft(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">{step.instruction}</div>

      <div className="flex gap-8">
        {/* 왼쪽 항목 */}
        <div className="flex-1 space-y-3">
          {step.pairs.map((pair) => {
            const isConnected = !!connections[pair.id];
            const isSelected = selectedLeft === pair.id;

            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => handleLeftClick(pair.id)}
                disabled={allConnected}
                className={`
                  w-full p-4 rounded-xl border-2 text-left text-sm
                  transition-all duration-200
                  ${isConnected ? "border-green-500 bg-green-500/10" : ""}
                  ${isSelected ? "border-primary bg-primary/10 ring-2 ring-primary/30" : ""}
                  ${!isConnected && !isSelected ? "border-border bg-card hover:border-muted-foreground/50" : ""}
                  ${allConnected ? "cursor-default" : "cursor-pointer"}
                `}
              >
                {pair.left}
              </button>
            );
          })}
        </div>

        {/* 오른쪽 항목 */}
        <div className="flex-1 space-y-3">
          {shuffledRight.map((item) => {
            const isConnected = connectedRights.has(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleRightClick(item.id)}
                disabled={allConnected || !selectedLeft || isConnected}
                className={`
                  w-full p-4 rounded-xl border-2 text-left text-sm
                  transition-all duration-200
                  ${isConnected ? "border-green-500 bg-green-500/10" : ""}
                  ${!isConnected && selectedLeft ? "border-primary/50 hover:border-primary hover:bg-primary/5" : ""}
                  ${!isConnected && !selectedLeft ? "border-border bg-card" : ""}
                  ${allConnected || isConnected ? "cursor-default" : "cursor-pointer"}
                `}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* 진행 상태 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {Object.keys(connections).length} / {step.pairs.length} 연결됨
        </span>
        {Object.keys(connections).length > 0 && !allConnected ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            다시 하기
          </Button>
        ) : null}
      </div>

      {allConnected ? (
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-green-500/10 border-2 border-green-500/20 animate-fade-in-up">
          <div className="bg-green-500 text-white p-3 rounded-full mb-3 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-green-700 mb-1">완벽해요!</h3>
          <p className="text-green-600/80">
            모든 항목을 올바르게 연결했습니다.
          </p>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================
// APPLICATION Step Component
// ============================================================
function ApplicationStep({
  step,
  selectedIndex,
  onSelect,
}: {
  step: Extract<SessionStep, { type: "APPLICATION" }>;
  selectedIndex: number | undefined;
  onSelect: (index: number) => void;
}) {
  const hasSelected = selectedIndex !== undefined;
  const isCorrect = hasSelected && selectedIndex === step.correctIndex;

  return (
    <div className="space-y-6">
      {/* 시나리오 */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-primary">상황</div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {step.scenario}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 질문 */}
      <h2 className="text-lg font-bold">{step.question}</h2>

      {/* 선택지 */}
      <div className="space-y-3">
        {step.options.map((opt, idx) => {
          const isSelected = selectedIndex === idx;
          const showCorrect = hasSelected && idx === step.correctIndex;
          const showWrong = hasSelected && isSelected && !isCorrect;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => !hasSelected && onSelect(idx)}
              disabled={hasSelected}
              className={`
                w-full p-4 rounded-xl border-2 text-left text-sm
                transition-all duration-200
                ${hasSelected ? "cursor-default" : "cursor-pointer hover:scale-[1.01] hover:shadow-md"}
                ${showCorrect ? "border-green-500 bg-green-500/10" : ""}
                ${showWrong ? "border-red-500 bg-red-500/10" : ""}
                ${!hasSelected && isSelected ? "border-primary bg-primary/5" : ""}
                ${!hasSelected && !isSelected ? "border-border bg-card" : ""}
                ${hasSelected && !showCorrect && !showWrong ? "border-border bg-card opacity-50" : ""}
              `}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`
                    shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                    ${showCorrect ? "bg-green-500 text-white" : ""}
                    ${showWrong ? "bg-red-500 text-white" : ""}
                    ${!hasSelected ? "bg-muted text-muted-foreground" : ""}
                    ${hasSelected && !showCorrect && !showWrong ? "bg-muted text-muted-foreground" : ""}
                  `}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 피드백 */}
      {hasSelected && step.feedback ? (
        <div
          className={`p-4 rounded-xl border ${isCorrect ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`}
        >
          <div className="flex items-start gap-2">
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            )}
            <div className="text-sm text-muted-foreground">{step.feedback}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
