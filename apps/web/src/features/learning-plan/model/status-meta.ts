import type {
  LearningTaskNoteStatus,
  LearningTaskQuizStatus,
} from "@/features/learning-plan/model/types";

export const AI_NOTE_STATUS_META: Record<
  LearningTaskNoteStatus,
  {
    label: string;
    badgeVariant: "outline" | "primary" | "secondary" | "destructive";
  }
> = {
  idle: { label: "미생성", badgeVariant: "outline" },
  processing: { label: "생성 중", badgeVariant: "secondary" },
  ready: { label: "생성 완료", badgeVariant: "primary" },
  failed: { label: "생성 실패", badgeVariant: "destructive" },
};

export const AI_QUIZ_STATUS_META: Record<
  LearningTaskQuizStatus,
  {
    label: string;
    badgeVariant: "outline" | "primary" | "secondary" | "destructive";
  }
> = {
  idle: { label: "미생성", badgeVariant: "outline" },
  processing: { label: "생성 중", badgeVariant: "secondary" },
  ready: { label: "준비 완료", badgeVariant: "primary" },
  failed: { label: "생성 실패", badgeVariant: "destructive" },
};
