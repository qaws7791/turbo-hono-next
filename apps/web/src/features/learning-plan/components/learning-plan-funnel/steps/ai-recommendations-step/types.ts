export interface AiRecommendationsStepProps {
  documentId: string;
  learningTopic: string;
  mainGoal: string;
  onBack: () => void;
  onNext: (data: {
    userLevel: string;
    targetWeeks: number;
    weeklyHours: number;
    learningStyle: string;
    preferredResources: string;
  }) => void;
}

export interface RecommendedSettings {
  userLevel: string;
  targetWeeks: number;
  weeklyHours: number;
  learningStyle: string;
  preferredResources: string;
}
