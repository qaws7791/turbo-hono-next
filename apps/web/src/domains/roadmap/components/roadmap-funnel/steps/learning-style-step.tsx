import { Button } from "@repo/ui/button";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import React from "react";

import { learningStyles } from "../constants";

import type { FunnelSteps } from "@/domains/roadmap/model/types";

interface LearningStyleStepProps {
  learningStyle: FunnelSteps["LearningStyle"]["learningStyle"];
  onBack: () => void;
  onNext: ({ learningStyle }: { learningStyle: string }) => void;
}

export const LearningStyleStep = (props: LearningStyleStepProps) => {
  const [selectedLearningStyle, setSelectedLearningStyle] =
    React.useState<string>(props.learningStyle || "");
  const isValid = selectedLearningStyle.length > 0;
  return (
    <>
      <div className="p-8">
        <div className="space-y-6">
          <div className="text-center">
            <User className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">학습 스타일</h2>
            <p className="text-gray-600">
              어떤 방식으로 학습하는 것을 선호하시나요?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {learningStyles.map((style) => (
              <div
                key={style.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedLearningStyle === style.id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
                onClick={() => setSelectedLearningStyle(style.id)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{style.icon}</div>
                  <div className="font-medium">{style.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className=" px-6 py-4 flex justify-between">
        <Button onClick={() => props.onBack()}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          이전
        </Button>

        <Button
          onClick={() =>
            props.onNext({
              learningStyle: selectedLearningStyle,
            })
          }
          isDisabled={!isValid}
        >
          다음
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </>
  );
};
