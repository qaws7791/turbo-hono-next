import type { StepKeys } from "@/domains/roadmap/model/types";

export const STEP_INFO: Record<
  StepKeys,
  { order: number; label: string; nextLabel?: string }
> = {
  DocumentUpload: { order: 1, label: "문서 업로드" },
  TopicSelection: { order: 2, label: "주제 선택" },
  LearningStyle: { order: 3, label: "학습 스타일" },
  ResourceTypes: { order: 4, label: "자료 유형" },
  Goals: { order: 5, label: "목표 설정", nextLabel: "완료" },
};

export const TOTAL_STEPS = Object.keys(STEP_INFO).length;

export const learningStyles = [
  { id: "시각적 학습", label: "시각적 학습", icon: "👁️" },
  { id: "실습 중심", label: "실습 중심", icon: "🛠️" },
  { id: "문서 읽기", label: "문서 읽기", icon: "📚" },
  { id: "동영상 강의", label: "동영상 강의", icon: "🎥" },
  { id: "대화형 학습", label: "대화형 학습", icon: "💬" },
  { id: "프로젝트 기반", label: "프로젝트 기반", icon: "🚀" },
];

export const resourceTypes = [
  { id: "온라인 강의", label: "온라인 강의", icon: "🎓" },
  { id: "책/전자책", label: "책/전자책", icon: "📖" },
  { id: "튜토리얼", label: "튜토리얼", icon: "📝" },
  { id: "유튜브 영상", label: "유튜브 영상", icon: "📺" },
  { id: "공식 문서", label: "공식 문서", icon: "📋" },
  { id: "실습 사이트", label: "실습 사이트", icon: "⚡" },
];
