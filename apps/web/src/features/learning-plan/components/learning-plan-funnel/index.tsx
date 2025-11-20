"use client";
import { useFunnel } from "@use-funnel/browser";

import { AiRecommendationsStep } from "./steps/ai-recommendations-step";
import { FlowSelectionStep } from "./steps/flow-selection-step";
import { ManualInputStep } from "./steps/manual-input-step";
import { PdfInputStep } from "./steps/pdf-input-step";

import type {
  FunnelData,
  FunnelSteps,
  LearningPlanFunnelProps,
} from "@/features/learning-plan/model/types";

import { useLearningPlanCreation } from "@/features/learning-plan/hooks/use-learning-plan-creation";

const LearningPlanFunnel = ({ onSubmit }: LearningPlanFunnelProps) => {
  const { isCreating, error, handleCreateLearningPlan } =
    useLearningPlanCreation(onSubmit);

  const funnel = useFunnel<FunnelSteps>({
    id: "learning-plan-funnel",
    initial: {
      step: "FlowSelection",
      context: {},
    },
  });

  return (
    <div className="h-full max-w-2xl mx-auto w-full flex flex-col justify-between">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mx-8 mt-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <funnel.Render
        FlowSelection={() => (
          <FlowSelectionStep
            onSelectPdfFlow={() => funnel.history.push("PdfInput", {})}
            onSelectManualFlow={() => funnel.history.push("ManualInput", {})}
          />
        )}
        PdfInput={({ context, history }) => (
          <PdfInputStep
            documentId={context.documentId}
            learningTopic={context.learningTopic}
            mainGoal={context.mainGoal}
            onBack={() => history.push("FlowSelection", {})}
            onNext={(data) =>
              history.push("AiRecommendations", {
                documentId: data.documentId,
                learningTopic: data.learningTopic,
                mainGoal: data.mainGoal,
              })
            }
          />
        )}
        AiRecommendations={({ context, history }) => {
          if (
            !context.documentId ||
            !context.learningTopic ||
            !context.mainGoal
          ) {
            // If required data is missing, go back to PdfInput
            history.push("PdfInput", {});
            return null;
          }

          return (
            <AiRecommendationsStep
              documentId={context.documentId}
              learningTopic={context.learningTopic}
              mainGoal={context.mainGoal}
              onBack={() =>
                history.push("PdfInput", {
                  documentId: context.documentId,
                  learningTopic: context.learningTopic,
                  mainGoal: context.mainGoal,
                })
              }
              onNext={(data) => {
                const funnelData: FunnelData = {
                  documentId: context.documentId,
                  learningTopic: context.learningTopic,
                  mainGoal: context.mainGoal,
                  userLevel: data.userLevel,
                  targetWeeks: data.targetWeeks,
                  weeklyHours: data.weeklyHours,
                  learningStyle: data.learningStyle,
                  preferredResources: data.preferredResources,
                };
                handleCreateLearningPlan(funnelData);
              }}
            />
          );
        }}
        ManualInput={({ history }) => (
          <ManualInputStep
            onBack={() => history.push("FlowSelection", {})}
            onNext={(data) => {
              const funnelData: FunnelData = {
                learningTopic: data.learningTopic,
                mainGoal: data.mainGoal,
                userLevel: data.userLevel,
                targetWeeks: data.targetWeeks,
                weeklyHours: data.weeklyHours,
                learningStyle: data.learningStyle,
                preferredResources: data.preferredResources,
                additionalRequirements: data.additionalRequirements,
              };
              handleCreateLearningPlan(funnelData);
            }}
          />
        )}
      />

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-700">학습 계획을 생성하는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPlanFunnel;
