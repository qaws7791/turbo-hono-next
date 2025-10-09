"use client";
import { useFunnel } from "@use-funnel/browser";
import React from "react";
import { ProgressHeader } from "./progress-header";
import { DocumentUploadStep } from "./steps/document-upload-step";
import { GoalsStep } from "./steps/goals-step";
import { LearningStyleStep } from "./steps/learning-style-step";
import { ResourceTypesStep } from "./steps/resource-types-step";
import { TopicSelectionStep } from "./steps/topic-selection-step";
import type { FunnelData, FunnelSteps, RoadmapFunnelProps } from "@/domains/roadmap/types";
import { transformFunnelDataToApiFormat } from "./utils";

const RoadmapFunnel = ({ onSubmit }: RoadmapFunnelProps) => {
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const funnel = useFunnel<FunnelSteps>({
    id: "roadmap-funnel",
    initial: {
      step: "DocumentUpload",
      context: {
        documentId: undefined,
        learningTopic: "",
        currentLevel: 1,
        targetWeeks: 4,
        weeklyHours: 10,
      },
    },
  });

  const handleCreateRoadmap = async (funnelData: FunnelData) => {
    try {
      setIsCreating(true);
      setError(null);

      // Transform funnel data to match AI API format
      const apiData = transformFunnelDataToApiFormat(funnelData);
      onSubmit(apiData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
      console.error("로드맵 생성 실패:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="h-full max-w-2xl mx-auto w-full flex flex-col justify-between">
      <funnel.Render
        DocumentUpload={({ context, history }) => (
          <>
            <ProgressHeader currentStep="DocumentUpload" />
            <DocumentUploadStep
              documentId={context.documentId}
              onNext={(data) =>
                history.push("TopicSelection", {
                  documentId: data.documentId,
                })
              }
            />
          </>
        )}
        TopicSelection={({ context, history }) => (
          <>
            <ProgressHeader currentStep="TopicSelection" />
            <TopicSelectionStep
              learningTopic={context.learningTopic}
              currentLevel={context.currentLevel}
              targetWeeks={context.targetWeeks}
              weeklyHours={context.weeklyHours}
              onNext={(data) =>
                history.push("LearningStyle", {
                  documentId: context.documentId,
                  learningTopic: data.learningTopic,
                  currentLevel: data.currentLevel,
                  targetWeeks: data.targetWeeks,
                  weeklyHours: data.weeklyHours,
                })
              }
            />
          </>
        )}
        LearningStyle={({ context, history }) => (
          <>
            <ProgressHeader currentStep="LearningStyle" />
            <LearningStyleStep
              learningStyle={context.learningStyle}
              onBack={() => history.push("TopicSelection")}
              onNext={(data) =>
                history.push("ResourceTypes", {
                  documentId: context.documentId,
                  learningStyle: data.learningStyle,
                })
              }
            />
          </>
        )}
        ResourceTypes={({ context, history }) => (
          <>
            <ProgressHeader currentStep="ResourceTypes" />
            <ResourceTypesStep
              preferredResources={context.preferredResources}
              onBack={() => history.push("LearningStyle")}
              onNext={(data) =>
                history.push("Goals", {
                  documentId: context.documentId,
                  preferredResources: data.preferredResources,
                })
              }
            />
          </>
        )}
        Goals={({ context, history }) => {
          const funnelData: FunnelData = {
            documentId: context.documentId,
            learningTopic: context.learningTopic,
            currentLevel: context.currentLevel,
            targetWeeks: context.targetWeeks,
            weeklyHours: context.weeklyHours,
            learningStyle: context.learningStyle,
            preferredResources: context.preferredResources,
            mainGoal: context.mainGoal || "",
            additionalRequirements: context.additionalRequirements,
          };

          return (
            <>
              <ProgressHeader currentStep="Goals" />
              <GoalsStep
                mainGoal={context.mainGoal}
                additionalRequirements={context.additionalRequirements}
                isCreating={isCreating}
                error={error}
                onBack={() => history.push("ResourceTypes")}
                onNext={(data) => {
                  const completeFunnelData = {
                    ...funnelData,
                    mainGoal: data.mainGoal,
                    additionalRequirements: data.additionalRequirements,
                  };
                  handleCreateRoadmap(completeFunnelData);
                }}
              />
            </>
          );
        }}
      />
    </div>
  );
};

export default RoadmapFunnel;
