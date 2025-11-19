import { Button } from "@repo/ui/button";
import { ChevronLeft } from "lucide-react";

interface ErrorStateProps {
  error: Error;
  onBack: () => void;
}

export const ErrorState = ({ error, onBack }: ErrorStateProps) => {
  return (
    <>
      <div className="p-8">
        <div className="text-center space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
          <p className="text-gray-600">
            AI 추천을 가져오는데 문제가 발생했습니다.
            <br />
            다시 시도해주세요.
          </p>
        </div>
      </div>
      <div className="px-6 py-4 flex justify-between">
        <Button
          onClick={onBack}
          variant="ghost"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          이전
        </Button>
        <Button isDisabled>다음</Button>
      </div>
    </>
  );
};
