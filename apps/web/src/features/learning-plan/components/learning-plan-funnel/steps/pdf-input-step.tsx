import { Button } from "@repo/ui/button";
import { FormTextField } from "@repo/ui/text-field";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

import { usePdfInputForm } from "@/features/learning-plan/hooks/use-pdf-input-form";
import { FileUpload } from "@/shared/components/file-upload";

interface PdfInputStepProps {
  documentId?: string;
  learningTopic?: string;
  mainGoal?: string;
  onBack: () => void;
  onNext: (data: {
    documentId: string;
    learningTopic: string;
    mainGoal: string;
  }) => void;
}

export const PdfInputStep = (props: PdfInputStepProps) => {
  const {
    document,
    learningTopic,
    setLearningTopic,
    mainGoal,
    setMainGoal,
    error,
    isUploading,
    isValid,
    handleUpload,
    handleDelete,
    getFormData,
  } = usePdfInputForm(props.learningTopic, props.mainGoal);

  const handleNext = () => {
    if (!isValid) {
      return;
    }
    props.onNext(getFormData());
  };

  return (
    <>
      <div className="p-8">
        <div className="space-y-6">
          <div className="text-center">
            <FileText className="mx-auto h-16 w-16 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">학습 자료와 목표 입력</h2>
            <p className="text-gray-600">
              PDF 문서를 업로드하고 학습 주제와 목표를 입력해주세요.
              <br />
              AI가 최적의 학습 계획을 추천해드립니다.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <FileUpload
            documents={document ? [document] : []}
            onUpload={handleUpload}
            onDelete={handleDelete}
            maxFiles={1}
            isUploading={isUploading}
          />

          <div className="space-y-4">
            <FormTextField
              label="학습 주제"
              description="무엇을 배우고 싶으신가요? (예: React 고급 패턴, TypeScript 타입 시스템)"
              value={learningTopic}
              onChange={setLearningTopic}
              isRequired
            />

            <FormTextField
              label="학습 목표"
              description="이 학습을 통해 달성하고 싶은 구체적인 목표를 입력해주세요 (예: 프로덕션 레벨의 React 애플리케이션 개발 능력 갖추기)"
              value={mainGoal}
              onChange={setMainGoal}
              isRequired
            />
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              💡 다음 단계에서 AI가 문서를 분석하여 최적의 학습 설정을
              추천해드립니다
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 flex justify-between">
        <Button
          onClick={props.onBack}
          variant="ghost"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          이전
        </Button>

        <Button
          onClick={handleNext}
          isDisabled={!isValid || isUploading}
        >
          AI 추천받기
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </>
  );
};
