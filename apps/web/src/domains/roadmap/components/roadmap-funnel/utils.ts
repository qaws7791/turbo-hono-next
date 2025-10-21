import type { ApiRoadmapData, FunnelData } from "@/domains/roadmap/types";

export const getCurrentLevelLabel = (level: number) => {
  return level === 1
    ? "초보자"
    : level === 2
      ? "기초"
      : level === 3
        ? "중급"
        : level === 4
          ? "고급"
          : "전문가";
};

export const handleArrayToggle = (array: Array<string>, id: string) => {
  if (array.includes(id)) {
    return array.filter((item) => item !== id);
  } else {
    return [...array, id];
  }
};

export const transformFunnelDataToApiFormat = (
  funnelData: FunnelData,
): ApiRoadmapData => {
  return {
    documentId: funnelData.documentId,
    learningTopic: funnelData.learningTopic,
    userLevel: getCurrentLevelLabel(funnelData.currentLevel) as
      | "초보자"
      | "기초"
      | "중급"
      | "고급"
      | "전문가",
    targetWeeks: funnelData.targetWeeks,
    weeklyHours: funnelData.weeklyHours,
    learningStyle: funnelData.learningStyle as
      | "시각적 학습"
      | "실습 중심"
      | "문서 읽기"
      | "동영상 강의"
      | "대화형 학습"
      | "프로젝트 기반",
    preferredResources: funnelData.preferredResources as
      | "온라인 강의"
      | "책/전자책"
      | "튜토리얼"
      | "유튜브 영상"
      | "공식 문서"
      | "실습 사이트",
    mainGoal: funnelData.mainGoal,
    additionalRequirements: funnelData.additionalRequirements,
  };
};
