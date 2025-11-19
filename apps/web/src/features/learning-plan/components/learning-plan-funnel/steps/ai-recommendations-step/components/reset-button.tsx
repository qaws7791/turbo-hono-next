import { Button } from "@repo/ui/button";
import { RotateCcw } from "lucide-react";

interface ResetButtonProps {
  onReset: () => void;
}

export const ResetButton = ({ onReset }: ResetButtonProps) => {
  return (
    <div className="flex justify-center">
      <Button
        onClick={onReset}
        variant="outline"
        className="gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        AI 추천으로 되돌리기
      </Button>
    </div>
  );
};
