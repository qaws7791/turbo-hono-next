// Core Domain Types
export interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageUrl: string;
  learningPlanId: number | null;
  uploadedAt: string;
  createdAt: string;
}

export type LearningTaskNoteStatus = "idle" | "processing" | "ready" | "failed";
export type LearningTaskQuizStatus = "idle" | "processing" | "ready" | "failed";

export interface LearningTaskQuizQuestion {
  id: string;
  prompt: string;
  options: Array<string>;
}

export interface LearningTaskQuizAnswerReview extends LearningTaskQuizQuestion {
  selectedIndex: number;
  correctIndex: number;
  explanation: string;
  isCorrect: boolean;
}

export interface LearningTaskQuizResult {
  quizId: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  answers: Array<LearningTaskQuizAnswerReview>;
  submittedAt: string;
}

export interface LearningTaskQuiz {
  id: string;
  status: LearningTaskQuizStatus;
  targetQuestionCount: number;
  totalQuestions: number | null;
  requestedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  questions: Array<LearningTaskQuizQuestion> | null;
  latestResult: LearningTaskQuizResult | null;
}

export interface LearningTask {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isCompleted: boolean;
  completedAt: string | null;
  dueDate?: string | null;
  memo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LearningTaskDetail extends LearningTask {
  learningModule: {
    id: string;
    title: string;
    description: string | null;
    order: number;
  };
  learningPlan: {
    id: string;
    title: string;
  };
}

export interface LearningModule {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isExpanded: boolean;
  learningTasks: Array<LearningTask>;

  // Computed properties for UI
  hasLearningTasks: boolean;
  completedLearningTasks: number;
  isCompleted: boolean;
}

export interface LearningPlan {
  id: number;
  emoji: string;
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
  learningModules: Array<LearningModule>;
  createdAt: string;
  updatedAt: string;
}

// Funnel Types
export type FunnelSteps = {
  FlowSelection: Record<string, never>;
  PdfInput: {
    documentId?: string;
    learningTopic?: string;
    mainGoal?: string;
  };
  AiRecommendations: {
    documentId: string;
    learningTopic: string;
    mainGoal: string;
    userLevel?: string;
    targetWeeks?: number;
    weeklyHours?: number;
    learningStyle?: string;
    preferredResources?: string;
  };
  ManualInput: Record<string, never>;
};

export type StepKeys = keyof FunnelSteps;

export interface FunnelData {
  documentId?: string;
  learningTopic: string;
  userLevel: string;
  targetWeeks: number;
  weeklyHours: number;
  learningStyle: string;
  preferredResources: string;
  mainGoal: string;
  additionalRequirements?: string;
}

export interface ApiLearningPlanData {
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

export interface LearningPlanFunnelProps {
  onSubmit: (apiData: ApiLearningPlanData) => void;
}
