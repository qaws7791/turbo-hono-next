import { Button } from "@repo/ui/button";
import { RadioGroup, RadioGroupItem } from "@repo/ui/radio-group";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type {
  CreateRunActivityBody,
  SessionRunDetailResponse,
} from "../domain";

type SessionRunDetail = SessionRunDetailResponse["data"];
type SessionStep = SessionRunDetail["blueprint"]["steps"][number];

/* --------------------------------------------------
   Step Content Components
-------------------------------------------------- */

function StepSessionIntro({
  step,
}: {
  step: Extract<SessionStep, { type: "SESSION_INTRO" }>;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="text-muted-foreground text-xs">오늘의 학습</div>
        <div className="text-lg font-semibold">{step.sessionTitle}</div>
        <div className="text-muted-foreground text-sm">
          {step.planTitle} · {step.moduleTitle} · {step.durationMinutes}분
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="text-sm font-medium">학습 목표</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
            {step.learningGoals.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-sm font-medium">다룰 질문</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
            {step.questionsToCover.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StepConcept({
  step,
}: {
  step: Extract<SessionStep, { type: "CONCEPT" }>;
}) {
  return (
    <div className="space-y-3">
      <div className="text-base font-semibold">{step.title}</div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <Markdown remarkPlugins={[remarkGfm]}>{step.content}</Markdown>
      </div>
    </div>
  );
}

function StepCheck({
  step,
  inputs,
  onUpdateInputs,
  onRecordActivity,
}: {
  step: Extract<SessionStep, { type: "CHECK" }>;
  inputs: Record<string, unknown>;
  onUpdateInputs: (patch: Record<string, unknown>) => void;
  onRecordActivity: (body: CreateRunActivityBody) => void;
}) {
  const key = `step.${step.id}.selectedIndex`;
  const selectedIndex = inputs[key];
  const selected = typeof selectedIndex === "number" ? selectedIndex : null;
  const selectedStr = typeof selected === "number" ? String(selected) : "";

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="text-sm font-medium">Q.</div>
        <div className="text-muted-foreground text-sm">{step.question}</div>
      </div>
      <RadioGroup
        value={selectedStr}
        onValueChange={(value: unknown) => {
          if (typeof value === "string") {
            const index = Number(value);
            onUpdateInputs({ [key]: index });
            onRecordActivity({
              kind: "MCQ",
              prompt: step.question,
              userAnswer: step.options[index],
              aiEvalJson: {
                stepId: step.id,
                stepType: step.type,
                answerIndex: index,
                correctIndex: step.answerIndex,
                isCorrect: index === step.answerIndex,
              },
            });
          }
        }}
      >
        {step.options.map((opt, idx) => (
          <label
            key={opt}
            className="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-xl border p-3"
          >
            <RadioGroupItem value={String(idx)} />
            <div className="text-sm">{opt}</div>
          </label>
        ))}
      </RadioGroup>
      {typeof selected === "number" && step.explanation ? (
        <div className="text-muted-foreground text-sm">
          {selected === step.answerIndex ? (
            <span className="text-emerald-600 dark:text-emerald-400">
              정답입니다.
            </span>
          ) : (
            <span className="text-rose-600 dark:text-rose-400">
              오답입니다.
            </span>
          )}{" "}
          {step.explanation}
        </div>
      ) : null}
    </div>
  );
}

function StepCloze({
  step,
  inputs,
  onUpdateInputs,
  onRecordActivity,
}: {
  step: Extract<SessionStep, { type: "CLOZE" }>;
  inputs: Record<string, unknown>;
  onUpdateInputs: (patch: Record<string, unknown>) => void;
  onRecordActivity: (body: CreateRunActivityBody) => void;
}) {
  const key = `step.${step.id}.selectedIndex`;
  const selectedIndex = inputs[key];
  const selected = typeof selectedIndex === "number" ? selectedIndex : null;
  const sentence = step.sentence.replaceAll("{{blank}}", "____");

  return (
    <div className="space-y-4">
      <div className="text-base font-semibold">{sentence}</div>
      <div className="grid gap-2">
        {step.options.map((opt, index) => {
          const isSelected = selected === index;
          return (
            <button
              key={`${step.id}-${index}`}
              type="button"
              className={[
                "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50",
              ].join(" ")}
              onClick={() => {
                onUpdateInputs({ [key]: index });
                onRecordActivity({
                  kind: "MCQ",
                  prompt: sentence,
                  userAnswer: opt,
                  aiEvalJson: {
                    stepId: step.id,
                    stepType: step.type,
                    blankId: step.blankId,
                    answerIndex: index,
                    correctIndex: step.answerIndex,
                    isCorrect: index === step.answerIndex,
                  },
                });
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {typeof selected === "number" && step.explanation ? (
        <div className="text-muted-foreground text-sm">
          {selected === step.answerIndex ? (
            <span className="text-emerald-600 dark:text-emerald-400">
              정답입니다.
            </span>
          ) : (
            <span className="text-rose-600 dark:text-rose-400">
              오답입니다.
            </span>
          )}{" "}
          {step.explanation}
        </div>
      ) : null}
    </div>
  );
}

function StepMatching({
  step,
  inputs,
  onUpdateInputs,
}: {
  step: Extract<SessionStep, { type: "MATCHING" }>;
  inputs: Record<string, unknown>;
  onUpdateInputs: (patch: Record<string, unknown>) => void;
}) {
  const key = `step.${step.id}.matches`;
  const matches = inputs[key];
  const current =
    matches && typeof matches === "object" && !Array.isArray(matches)
      ? (matches as Record<string, unknown>)
      : {};

  return (
    <div className="space-y-4">
      <div className="text-base font-semibold">{step.instruction}</div>
      <div className="space-y-3">
        {step.pairs.map((pair) => {
          const value = current[pair.id];
          const selected = typeof value === "string" ? value : "";

          return (
            <div
              key={pair.id}
              className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2 sm:items-center"
            >
              <div className="text-sm font-medium">{pair.left}</div>
              <select
                className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                value={selected}
                onChange={(e) => {
                  onUpdateInputs({
                    [key]: {
                      ...current,
                      [pair.id]: e.target.value,
                    },
                  });
                }}
              >
                <option value="">선택…</option>
                {step.pairs.map((p) => (
                  <option
                    key={p.id}
                    value={p.right}
                  >
                    {p.right}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
      <div className="text-muted-foreground text-xs">
        매칭은 정답 판정 없이 입력만 저장합니다.
      </div>
    </div>
  );
}

function StepFlashcard({
  step,
  inputs,
  onUpdateInputs,
}: {
  step: Extract<SessionStep, { type: "FLASHCARD" }>;
  inputs: Record<string, unknown>;
  onUpdateInputs: (patch: Record<string, unknown>) => void;
}) {
  const key = `step.${step.id}.flipped`;
  const flipped = Boolean(inputs[key]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-4">
        <div className="text-muted-foreground text-xs">
          {flipped ? "Back" : "Front"}
        </div>
        <div className="mt-2 whitespace-pre-wrap text-sm">
          {flipped ? step.back : step.front}
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => onUpdateInputs({ [key]: !flipped })}
      >
        {flipped ? "앞면 보기" : "뒷면 보기"}
      </Button>
    </div>
  );
}

function StepSpeedOX({
  step,
  inputs,
  onUpdateInputs,
  onRecordActivity,
}: {
  step: Extract<SessionStep, { type: "SPEED_OX" }>;
  inputs: Record<string, unknown>;
  onUpdateInputs: (patch: Record<string, unknown>) => void;
  onRecordActivity: (body: CreateRunActivityBody) => void;
}) {
  const key = `step.${step.id}.answer`;
  const answer = inputs[key];
  const selected = typeof answer === "boolean" ? answer : null;

  const handleAnswer = (value: boolean) => {
    onUpdateInputs({ [key]: value });
    onRecordActivity({
      kind: "MCQ",
      prompt: step.statement,
      userAnswer: value ? "O" : "X",
      aiEvalJson: {
        stepId: step.id,
        stepType: step.type,
        isTrue: step.isTrue,
        isCorrect: step.isTrue === value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-base font-semibold">{step.statement}</div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={selected === true ? "default" : "outline"}
          onClick={() => handleAnswer(true)}
        >
          O
        </Button>
        <Button
          type="button"
          variant={selected === false ? "default" : "outline"}
          onClick={() => handleAnswer(false)}
        >
          X
        </Button>
      </div>
      {typeof selected === "boolean" && step.explanation ? (
        <div className="text-muted-foreground text-sm">
          {selected === step.isTrue ? (
            <span className="text-emerald-600 dark:text-emerald-400">
              정답입니다.
            </span>
          ) : (
            <span className="text-rose-600 dark:text-rose-400">
              오답입니다.
            </span>
          )}{" "}
          {step.explanation}
        </div>
      ) : null}
    </div>
  );
}

function StepApplication({
  step,
  inputs,
  onUpdateInputs,
  onRecordActivity,
}: {
  step: Extract<SessionStep, { type: "APPLICATION" }>;
  inputs: Record<string, unknown>;
  onUpdateInputs: (patch: Record<string, unknown>) => void;
  onRecordActivity: (body: CreateRunActivityBody) => void;
}) {
  const key = `step.${step.id}.selectedIndex`;
  const selectedIndex = inputs[key];
  const selected = typeof selectedIndex === "number" ? selectedIndex : null;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-3 text-sm">
        <div className="text-muted-foreground text-xs">상황</div>
        <div className="mt-1">{step.scenario}</div>
      </div>
      <div className="text-base font-semibold">{step.question}</div>
      <div className="grid gap-2">
        {step.options.map((opt, index) => {
          const isSelected = selected === index;
          return (
            <button
              key={`${step.id}-${index}`}
              type="button"
              className={[
                "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50",
              ].join(" ")}
              onClick={() => {
                onUpdateInputs({ [key]: index });
                onRecordActivity({
                  kind: "EXERCISE",
                  prompt: `${step.scenario}\n\n${step.question}`,
                  userAnswer: opt,
                  aiEvalJson: {
                    stepId: step.id,
                    stepType: step.type,
                    answerIndex: index,
                    correctIndex: step.correctIndex,
                    isCorrect: index === step.correctIndex,
                  },
                });
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {typeof selected === "number" && step.feedback ? (
        <div className="text-muted-foreground text-sm">
          {selected === step.correctIndex ? (
            <span className="text-emerald-600 dark:text-emerald-400">
              정답입니다.
            </span>
          ) : (
            <span className="text-rose-600 dark:text-rose-400">
              오답입니다.
            </span>
          )}{" "}
          {step.feedback}
        </div>
      ) : null}
    </div>
  );
}

function StepSessionSummary({
  step,
}: {
  step: Extract<SessionStep, { type: "SESSION_SUMMARY" }>;
}) {
  const metaParts: Array<string> = [];
  if (typeof step.studyTimeMinutes === "number") {
    metaParts.push(`학습 시간 ${step.studyTimeMinutes}분`);
  }
  if (typeof step.savedConceptCount === "number") {
    metaParts.push(`저장된 개념 ${step.savedConceptCount}개`);
  }

  return (
    <div className="space-y-4">
      <div className="text-2xl font-semibold">
        {step.celebrationEmoji} 세션 요약
      </div>
      <div className="text-muted-foreground text-sm">{step.encouragement}</div>
      {metaParts.length ? (
        <div className="text-muted-foreground text-xs">
          {metaParts.join(" · ")}
        </div>
      ) : null}
      <div>
        <div className="text-sm font-medium">핵심 정리</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
          {step.keyTakeaways.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      {step.nextSessionPreview ? (
        <div className="rounded-lg border border-border p-3 text-sm">
          <div className="text-muted-foreground text-xs">다음 세션</div>
          <div className="mt-1 font-medium">
            {step.nextSessionPreview.title}
          </div>
          {step.nextSessionPreview.description ? (
            <div className="mt-1 text-muted-foreground text-xs">
              {step.nextSessionPreview.description}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------
   Step Content Dispatcher
-------------------------------------------------- */

export type SessionStepContentProps = {
  step: SessionStep;
  inputs: Record<string, unknown>;
  onUpdateInputs: (patch: Record<string, unknown>) => void;
  onRecordActivity: (body: CreateRunActivityBody) => void;
};

export function SessionStepContent({
  step,
  inputs,
  onUpdateInputs,
  onRecordActivity,
}: SessionStepContentProps) {
  switch (step.type) {
    case "SESSION_INTRO":
      return <StepSessionIntro step={step} />;
    case "CONCEPT":
      return <StepConcept step={step} />;
    case "CHECK":
      return (
        <StepCheck
          step={step}
          inputs={inputs}
          onUpdateInputs={onUpdateInputs}
          onRecordActivity={onRecordActivity}
        />
      );
    case "CLOZE":
      return (
        <StepCloze
          step={step}
          inputs={inputs}
          onUpdateInputs={onUpdateInputs}
          onRecordActivity={onRecordActivity}
        />
      );
    case "MATCHING":
      return (
        <StepMatching
          step={step}
          inputs={inputs}
          onUpdateInputs={onUpdateInputs}
        />
      );
    case "FLASHCARD":
      return (
        <StepFlashcard
          step={step}
          inputs={inputs}
          onUpdateInputs={onUpdateInputs}
        />
      );
    case "SPEED_OX":
      return (
        <StepSpeedOX
          step={step}
          inputs={inputs}
          onUpdateInputs={onUpdateInputs}
          onRecordActivity={onRecordActivity}
        />
      );
    case "APPLICATION":
      return (
        <StepApplication
          step={step}
          inputs={inputs}
          onUpdateInputs={onUpdateInputs}
          onRecordActivity={onRecordActivity}
        />
      );
    case "SESSION_SUMMARY":
      return <StepSessionSummary step={step} />;
    default: {
      const exhaustiveCheck: never = step;
      return exhaustiveCheck;
    }
  }
}
