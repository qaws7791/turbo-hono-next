import { Button } from "@repo/ui/button";
import { ChevronLeft, ChevronRight, Target } from "lucide-react";
import React from "react";

import { resourceTypes } from "../constants";

import type { FunnelSteps } from "@/features/roadmap/model/types";

interface ResourceTypesStepProps {
  preferredResources: FunnelSteps["ResourceTypes"]["preferredResources"];
  onBack: () => void;
  onNext: ({ preferredResources }: { preferredResources: string }) => void;
}

export const ResourceTypesStep = (props: ResourceTypesStepProps) => {
  const [selectedPreferredResources, setSelectedPreferredResources] =
    React.useState<string>(props.preferredResources || "");
  const isValid = selectedPreferredResources.length > 0;
  return (
    <>
      <div className="p-8">
        <div className="space-y-6">
          <div className="text-center">
            <Target className="mx-auto h-16 w-16 text-purple-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">선호하는 학습 자료</h2>
            <p className="text-gray-600">어떤 형태의 자료를 선호하시나요?</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {resourceTypes.map((resource) => (
              <div
                key={resource.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPreferredResources === resource.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
                onClick={() => setSelectedPreferredResources(resource.id)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{resource.icon}</div>
                  <div className="font-medium">{resource.label}</div>
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
              preferredResources: selectedPreferredResources,
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
