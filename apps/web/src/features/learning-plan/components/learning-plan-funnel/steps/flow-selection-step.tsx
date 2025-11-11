import { FileText, PenLine } from "lucide-react";

interface FlowSelectionStepProps {
  onSelectPdfFlow: () => void;
  onSelectManualFlow: () => void;
}

export const FlowSelectionStep = ({
  onSelectPdfFlow,
  onSelectManualFlow,
}: FlowSelectionStepProps) => {
  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">학습 계획 생성 방법 선택</h2>
          <p className="text-gray-600">
            어떤 방식으로 학습 계획을 만드시겠어요?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {/* PDF 기반 생성 */}
          <button
            onClick={onSelectPdfFlow}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  PDF로 빠르게 생성
                </h3>
                <p className="text-sm text-gray-600">
                  학습 자료를 업로드하면
                  <br />
                  AI가 자동으로 최적의 설정을 추천합니다
                </p>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                ✓ AI 추천으로 빠른 설정
                <br />✓ 문서 기반 맞춤 계획
              </div>
            </div>
          </button>

          {/* 수동 입력 */}
          <button
            onClick={onSelectManualFlow}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <PenLine className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">직접 입력하기</h3>
                <p className="text-sm text-gray-600">
                  학습 주제와 상세 설정을
                  <br />
                  직접 입력하여 계획을 만듭니다
                </p>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                ✓ 세밀한 맞춤 설정
                <br />✓ 자유로운 계획 수립
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
