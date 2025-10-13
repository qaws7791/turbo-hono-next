// Core Domain Types
export interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageUrl: string;
  roadmapId: number | null;
  uploadedAt: string;
  createdAt: string;
}

export type SubGoalNoteStatus = "idle" | "processing" | "ready" | "failed";

export interface SubGoal {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isCompleted: boolean;
  dueDate?: string | null;
  memo?: string | null;
  createdAt: string;
  updatedAt: string;
  aiNoteStatus: SubGoalNoteStatus;
  aiNoteMarkdown: string | null;
  aiNoteRequestedAt: string | null;
  aiNoteCompletedAt: string | null;
  aiNoteError: string | null;
}

export interface SubGoalDetail extends SubGoal {
  goal: {
    id: string;
    title: string;
    description: string | null;
    order: number;
  };
  roadmap: {
    id: string;
    title: string;
  };
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isExpanded: boolean;
  subGoals: SubGoal[];

  // Computed properties for UI
  hasSubGoals: boolean;
  completedSubGoals: number;
  isCompleted: boolean;
}

export interface Roadmap {
  id: number;
  title: string;
  description: string | null;
  status: "active" | "archived";
  learningTopic: string;
  userLevel: string;
  targetWeeks: number;
  weeklyHours: number;
  learningStyle: string;
  preferredResources: string;
  mainGoal: string;
  additionalRequirements?: string;
  goals: Goal[];
  createdAt: string;
  updatedAt: string;
}

// Funnel Types
export type FunnelSteps = {
  DocumentUpload: {
    documentId?: string;
    learningTopic?: string;
    currentLevel?: number;
    targetWeeks?: number;
    weeklyHours?: number;
    learningStyle?: string;
    preferredResources?: string;
    mainGoal?: string;
    additionalRequirements?: string;
  };
  TopicSelection: {
    documentId?: string;
    learningTopic?: string;
    currentLevel?: number;
    targetWeeks?: number;
    weeklyHours?: number;
    learningStyle?: string;
    preferredResources?: string;
    mainGoal?: string;
    additionalRequirements?: string;
  };
  LearningStyle: {
    documentId?: string;
    learningTopic: string;
    currentLevel: number;
    targetWeeks: number;
    weeklyHours: number;
    learningStyle?: string;
    preferredResources?: string;
    mainGoal?: string;
    additionalRequirements?: string;
  };
  ResourceTypes: {
    documentId?: string;
    learningTopic: string;
    currentLevel: number;
    targetWeeks: number;
    weeklyHours: number;
    learningStyle: string;
    preferredResources?: string;
    mainGoal?: string;
    additionalRequirements?: string;
  };
  Goals: {
    documentId?: string;
    learningTopic: string;
    currentLevel: number;
    targetWeeks: number;
    weeklyHours: number;
    learningStyle: string;
    preferredResources: string;
    mainGoal?: string;
    additionalRequirements?: string;
  };
};

export type StepKeys = keyof FunnelSteps;

export interface FunnelData {
  documentId?: string;
  learningTopic: string;
  currentLevel: number;
  targetWeeks: number;
  weeklyHours: number;
  learningStyle: string;
  preferredResources: string;
  mainGoal: string;
  additionalRequirements?: string;
}

export interface ApiRoadmapData {
  documentId?: string;
  learningTopic: string;
  userLevel: "초보자" | "기초" | "중급" | "고급" | "전문가";
  targetWeeks: number;
  weeklyHours: number;
  learningStyle:
    | "시각적 학습"
    | "실습 중심"
    | "문서 읽기"
    | "동영상 강의"
    | "대화형 학습"
    | "프로젝트 기반";
  preferredResources:
    | "온라인 강의"
    | "책/전자책"
    | "튜토리얼"
    | "유튜브 영상"
    | "공식 문서"
    | "실습 사이트";
  mainGoal: string;
  additionalRequirements?: string;
}

export interface RoadmapFunnelProps {
  onSubmit: (apiData: ApiRoadmapData) => void;
}
