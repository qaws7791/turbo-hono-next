import { Button } from "@repo/ui/button";
import { FormTextField } from "@repo/ui/text-field";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  Loader2,
  Zap,
} from "lucide-react";
import React from "react";

import type { FunnelSteps } from "@/features/learning-plan/model/types";

interface LearningModulesStepProps {
  mainGoal: FunnelSteps["LearningModules"]["mainGoal"];
  additionalRequirements: FunnelSteps["LearningModules"]["additionalRequirements"];
  isCreating: boolean;
  error: string | null;
  onBack: () => void;
  onNext: ({
    mainGoal,
    additionalRequirements,
  }: {
    mainGoal: string;
    additionalRequirements: string | undefined;
  }) => void;
}

export const LearningModulesStep = (props: LearningModulesStepProps) => {
  const [mainGoal, setMainLearningModule] = React.useState(props.mainGoal);
  const [additionalRequirements, setAdditionalRequirements] = React.useState(
    props.additionalRequirements,
  );
  const isValid = mainGoal && mainGoal.length > 0;

  return (
    <>
      <div className="p-8">
        <div className="space-y-6">
          <div className="text-center">
            <Zap className="mx-auto h-16 w-16 text-orange-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">학습 목표 설정</h2>
            <p className="text-gray-600">구체적인 목표를 알려주세요</p>
          </div>

          {props.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-red-800 font-medium">
                  오류가 발생했습니다
                </h4>
                <p className="text-red-600 text-sm mt-1">{props.error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주요 목표
            </label>
            <FormTextField
              textArea
              description="예: 웹 개발자로 취업하기, 개인 프로젝트 만들기, 자격증 취득하기..."
              value={mainGoal}
              onChange={setMainLearningModule}
              isDisabled={props.isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              추가 요구사항 (선택사항)
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              rows={2}
              placeholder="특별히 집중하고 싶은 분야나 피하고 싶은 내용이 있다면..."
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              disabled={props.isCreating}
            />
          </div>
        </div>
      </div>

      <div className=" px-6 py-4 flex justify-between">
        <Button
          onClick={() => props.onBack()}
          isDisabled={props.isCreating}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          이전
        </Button>

        <Button
          onClick={() => {
            if (!isValid) return;
            props.onNext({ mainGoal, additionalRequirements });
          }}
          isDisabled={!isValid || props.isCreating}
        >
          {props.isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              학습 계획 생성 중...
            </>
          ) : (
            <>
              완료
              <CheckCircle className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </>
  );
};
