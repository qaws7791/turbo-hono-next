import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <h2 className="text-xl font-semibold mb-2">AI가 분석 중입니다...</h2>
      <p className="text-gray-600 text-center">
        업로드하신 문서를 분석하여
        <br />
        최적의 학습 계획을 추천하고 있습니다
      </p>
    </div>
  );
};
